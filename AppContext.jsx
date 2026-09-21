import React, { createContext, useContext, useMemo, useReducer, useEffect, useCallback } from "react";
import * as seed from "../data/seed.js";
import { crearRegistroInicial, continuarRegistro, completarOTyCC, tieneRegistroAsociado } from "../logic/historial.js";
import { validarOT, validarCC } from "../logic/validaciones.js";
import { resolverOTBolsa } from "../logic/otBolsa.js";
import { calcularHoras } from "../logic/horas.js";
import { nowIso, nextId } from "../logic/ids.js";

const STORAGE_KEY = "sgm_agd_timbues_demo_v1";

/**
 * Estado inicial: se toma de los datos semilla (src/data/seed.js), que
 * representan las tablas maestras del SGM y las tablas "importadas" desde
 * JD Edwards en el primer arranque de la demo.
 */
function estadoInicial() {
  return {
    // Tablas maestras propias del SGM (Configuración, sección 11.10)
    sectores: seed.sectores,
    empresas: seed.empresas,
    especialidades: seed.especialidades,
    turnos: seed.turnos,
    operarios: seed.operarios,
    equipos: seed.equipos,
    otBolsa: seed.otBolsa,
    otBloqueadas: seed.otBloqueadas,
    ccBloqueadas: seed.ccBloqueadas,

    // Tablas "importadas" desde JD Edwards (solo lectura sobre sus datos originales)
    ordenesDeTrabajo: seed.ordenesDeTrabajoJDE,
    pedidosDeTrabajo: seed.pedidosDeTrabajoJDE,

    // Transaccionales del SGM
    historial: seed.historialSemilla(),
    proveedoresRegistros: [],
    importLog: [],
    auditLog: [],

    // Sesión (simulada, sin backend de autenticación real)
    rolActual: "Administrador",
    usuarioActual: seed.usuariosDemo[0],
  };
}

function cargarEstado() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {
    console.warn("No se pudo leer el estado guardado, se reinicia con datos semilla.", e);
  }
  return estadoInicial();
}

const AppStateContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "SET_ROL":
      return { ...state, rolActual: action.rol, usuarioActual: action.usuario };
    case "AGREGAR_HISTORIAL":
      return { ...state, historial: [...state.historial, action.registro] };
    case "ACTUALIZAR_HISTORIAL":
      return {
        ...state,
        historial: state.historial.map((r) => (r.id === action.registro.id ? action.registro : r)),
      };
    case "AGREGAR_AUDITORIA":
      return { ...state, auditLog: [action.entrada, ...state.auditLog] };
    case "AGREGAR_IMPORT_LOG":
      return { ...state, importLog: [action.entrada, ...state.importLog] };
    case "AGREGAR_PROVEEDOR_REGISTRO":
      return { ...state, proveedoresRegistros: [...state.proveedoresRegistros, action.registro] };
    case "AGREGAR_MAESTRO": {
      const { tabla, item } = action;
      return { ...state, [tabla]: [...state[tabla], item] };
    }
    case "ACTUALIZAR_OT_CC_JDE": {
      // Si el Administrador completa el CC de una OT (RF-48), también se
      // refleja en la tabla espejo de OT (para que quede visible en el
      // listado de Orden de Trabajo, no solo en el registro de Historial).
      return {
        ...state,
        ordenesDeTrabajo: state.ordenesDeTrabajo.map((ot) =>
          ot.numero_ot === action.numero_ot ? { ...ot, numero_cc: action.numero_cc } : ot
        ),
      };
    }
    case "RESET_DEMO":
      return estadoInicial();
    default:
      throw new Error(`Acción desconocida: ${action.type}`);
  }
}

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, cargarEstado);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const registrarAuditoria = useCallback(
    (accion, detalle) => {
      dispatch({
        type: "AGREGAR_AUDITORIA",
        entrada: {
          id: nextId("AUD"),
          usuario: state.usuarioActual.usuario,
          accion,
          detalle,
          fecha_hora: nowIso(),
        },
      });
    },
    [state.usuarioActual]
  );

  // ---------------------------------------------------------------------
  // Formulario de Carga (RF-19 a RF-33): registro manual completo sobre OT
  // ---------------------------------------------------------------------
  const registrarFormularioCarga = useCallback(
    (datos) => {
      const ctxOT = { otsImportadas: state.ordenesDeTrabajo, otBloqueadas: state.otBloqueadas };
      const ctxCC = { ccBloqueadas: state.ccBloqueadas };

      const resultadoOT = validarOT(datos.numero_ot, ctxOT);
      if (!resultadoOT.valido) return { ok: false, errores: [resultadoOT.motivo] };

      const resultadoCC = validarCC(datos.numero_cc, ctxCC);
      if (!resultadoCC.valido) return { ok: false, errores: [resultadoCC.motivo] };

      const operariosSeleccionados = datos.operarios.map((id) => {
        const op = state.operarios.find((o) => o.id === id);
        const empresa = state.empresas.find((e) => e.id === op.empresa_id);
        return { id, empresaTipo: empresa.tipo };
      });

      const horas = calcularHoras({
        fechaInicio: datos.fecha_inicio,
        horaInicio: datos.hora_inicio,
        fechaFin: datos.fecha_fin,
        horaFin: datos.hora_fin,
        operarios: operariosSeleccionados,
      });
      if (horas.error) return { ok: false, errores: [horas.error] };

      const registro = crearRegistroInicial({
        usuario_carga: state.usuarioActual.usuario,
        origen: "Formulario de Carga",
        fecha_inicio: datos.fecha_inicio,
        hora_inicio: datos.hora_inicio,
        fecha_fin: datos.fecha_fin,
        hora_fin: datos.hora_fin,
        equipo_id: datos.equipo_id,
        sector_id: state.equipos.find((e) => e.id === datos.equipo_id)?.sector_id ?? null,
        descripcion: datos.descripcion,
        estado: datos.estado,
        numero_ot: resultadoOT.ot.numero_ot,
        numero_cc: datos.numero_cc.trim(),
        numero_pedido: datos.numero_pedido || null,
        es_ot_bolsa: !!datos.es_ot_bolsa,
        criticidad: datos.criticidad,
        operarios: datos.operarios,
        tipo_mantenimiento: datos.tipo_mantenimiento,
        turno_id: datos.turno_id,
        cantidadOperarios: horas.cantidadOperarios,
        totalHorasHombre: horas.totalHorasHombre,
        horasHombreAGD: horas.horasHombreAGD,
        horasHombreTerceros: horas.horasHombreTerceros,
        adjuntos: datos.adjuntos || [],
      });

      dispatch({ type: "AGREGAR_HISTORIAL", registro });
      registrarAuditoria("Alta Formulario de Carga", `OT ${registro.numero_ot} — ${registro.descripcion}`);
      return { ok: true, registro };
    },
    [state, registrarAuditoria]
  );

  // ---------------------------------------------------------------------
  // Registro rápido sobre Pedido de Trabajo (RF-35 a RF-38, sección 11.5)
  // ---------------------------------------------------------------------
  const registrarSobrePedido = useCallback(
    (numeroPedido, datos) => {
      const pedido = state.pedidosDeTrabajo.find((p) => p.numero_pedido === numeroPedido);
      if (!pedido) return { ok: false, errores: ["El Pedido de Trabajo no existe."] };

      const operariosSeleccionados = datos.operarios.map((id) => {
        const op = state.operarios.find((o) => o.id === id);
        const empresa = state.empresas.find((e) => e.id === op.empresa_id);
        return { id, empresaTipo: empresa.tipo };
      });

      const horas = calcularHoras({
        fechaInicio: datos.fecha_inicio,
        horaInicio: datos.hora_inicio,
        fechaFin: datos.fecha_fin,
        horaFin: datos.hora_fin,
        operarios: operariosSeleccionados,
      });
      if (horas.error) return { ok: false, errores: [horas.error] };

      const registro = crearRegistroInicial({
        usuario_carga: state.usuarioActual.usuario,
        origen: "Registro Rápido - Pedido",
        fecha_inicio: datos.fecha_inicio,
        hora_inicio: datos.hora_inicio,
        fecha_fin: datos.fecha_fin,
        hora_fin: datos.hora_fin,
        equipo_id: pedido.equipo_id, // RF-36: autocompletado, no editable
        sector_id: state.equipos.find((e) => e.id === pedido.equipo_id)?.sector_id ?? null,
        descripcion: datos.descripcion,
        estado: datos.estado,
        numero_ot: null, // RF-37: queda en blanco
        numero_cc: null, // RF-37: queda en blanco
        numero_pedido: numeroPedido,
        criticidad: datos.criticidad,
        operarios: datos.operarios,
        tipo_mantenimiento: datos.tipo_mantenimiento || "Correctivo",
        turno_id: datos.turno_id,
        cantidadOperarios: horas.cantidadOperarios,
        totalHorasHombre: horas.totalHorasHombre,
        horasHombreAGD: horas.horasHombreAGD,
        horasHombreTerceros: horas.horasHombreTerceros,
      });

      dispatch({ type: "AGREGAR_HISTORIAL", registro });
      registrarAuditoria("Registro rápido sobre Pedido", `${numeroPedido} — ${registro.descripcion}`);
      return { ok: true, registro };
    },
    [state, registrarAuditoria]
  );

  // ---------------------------------------------------------------------
  // Registro rápido sobre Orden de Trabajo (RF-45 a RF-49, sección 11.6)
  // ---------------------------------------------------------------------
  const registrarSobreOT = useCallback(
    (numeroOT, datos) => {
      const ot = state.ordenesDeTrabajo.find((o) => o.numero_ot === numeroOT);
      if (!ot) return { ok: false, errores: ["La Orden de Trabajo no existe."] };

      const operariosSeleccionados = datos.operarios.map((id) => {
        const op = state.operarios.find((o) => o.id === id);
        const empresa = state.empresas.find((e) => e.id === op.empresa_id);
        return { id, empresaTipo: empresa.tipo };
      });

      const horas = calcularHoras({
        fechaInicio: datos.fecha_inicio,
        horaInicio: datos.hora_inicio,
        fechaFin: datos.fecha_fin,
        horaFin: datos.hora_fin,
        operarios: operariosSeleccionados,
      });
      if (horas.error) return { ok: false, errores: [horas.error] };

      const registro = crearRegistroInicial({
        usuario_carga: state.usuarioActual.usuario,
        origen: "Registro Rápido - OT",
        fecha_inicio: datos.fecha_inicio,
        hora_inicio: datos.hora_inicio,
        fecha_fin: datos.fecha_fin,
        hora_fin: datos.hora_fin,
        equipo_id: ot.equipo_id, // RF-46: autocompletado
        sector_id: ot.sector_id,
        descripcion: datos.descripcion,
        estado: datos.estado,
        numero_ot: ot.numero_ot, // RF-47: ya determinado por la OT
        numero_cc: ot.numero_cc || null, // RF-48: autocompletado si JDE lo informa
        ot_numero_ref: ot.numero_ot,
        criticidad: datos.criticidad,
        operarios: datos.operarios,
        tipo_mantenimiento: datos.tipo_mantenimiento || "Correctivo",
        turno_id: datos.turno_id,
        cantidadOperarios: horas.cantidadOperarios,
        totalHorasHombre: horas.totalHorasHombre,
        horasHombreAGD: horas.horasHombreAGD,
        horasHombreTerceros: horas.horasHombreTerceros,
      });

      dispatch({ type: "AGREGAR_HISTORIAL", registro });
      registrarAuditoria("Registro rápido sobre OT", `${numeroOT} — ${registro.descripcion}`);
      return { ok: true, registro };
    },
    [state, registrarAuditoria]
  );

  // ---------------------------------------------------------------------
  // Pase de Turno: continuar una intervención pendiente (RF-16, RF-17)
  // ---------------------------------------------------------------------
  const continuarDesdeTurno = useCallback(
    (registroAnterior, datos) => {
      const operariosSeleccionados = datos.operarios.map((id) => {
        const op = state.operarios.find((o) => o.id === id);
        const empresa = state.empresas.find((e) => e.id === op.empresa_id);
        return { id, empresaTipo: empresa.tipo };
      });

      const horas = calcularHoras({
        fechaInicio: datos.fecha_inicio,
        horaInicio: datos.hora_inicio,
        fechaFin: datos.fecha_fin,
        horaFin: datos.hora_fin,
        operarios: operariosSeleccionados,
      });
      if (horas.error) return { ok: false, errores: [horas.error] };

      const nuevo = continuarRegistro(registroAnterior, {
        fecha_inicio: datos.fecha_inicio,
        hora_inicio: datos.hora_inicio,
        fecha_fin: datos.fecha_fin,
        hora_fin: datos.hora_fin,
        descripcion: datos.descripcion,
        estado: datos.estado,
        operarios: datos.operarios,
        cantidadOperarios: horas.cantidadOperarios,
        totalHorasHombre: horas.totalHorasHombre,
        horasHombreAGD: horas.horasHombreAGD,
        horasHombreTerceros: horas.horasHombreTerceros,
      });

      dispatch({ type: "AGREGAR_HISTORIAL", registro: nuevo });
      registrarAuditoria(
        "Continuidad desde Pase de Turno",
        `Cadena ${nuevo.id_original} — nuevo estado: ${nuevo.estado}`
      );
      return { ok: true, registro: nuevo };
    },
    [state, registrarAuditoria]
  );

  // ---------------------------------------------------------------------
  // Completar Número de OT / Número de CC pendiente (RF-39, RF-48)
  // ---------------------------------------------------------------------
  const completarPendiente = useCallback(
    (registro, valores) => {
      const ctx = {
        otsImportadas: state.ordenesDeTrabajo,
        otBloqueadas: state.otBloqueadas,
        ccBloqueadas: state.ccBloqueadas,
      };
      const resultado = completarOTyCC(registro, valores, ctx);
      if (!resultado.ok) return resultado;

      dispatch({ type: "ACTUALIZAR_HISTORIAL", registro: resultado.registro });

      // Si se completó el CC de una OT (registro rápido sobre OT), reflejarlo
      // también en la tabla espejo de OT para que quede visible en el listado.
      if (registro.origen === "Registro Rápido - OT" && valores.numero_cc) {
        dispatch({
          type: "ACTUALIZAR_OT_CC_JDE",
          numero_ot: registro.numero_ot,
          numero_cc: valores.numero_cc,
        });
      }

      registrarAuditoria(
        "Completar OT/CC pendiente",
        `Registro ${registro.id} — OT: ${resultado.registro.numero_ot ?? "-"} / CC: ${resultado.registro.numero_cc ?? "-"}`
      );
      return resultado;
    },
    [state, registrarAuditoria]
  );

  // ---------------------------------------------------------------------
  // Resolución de OT Bolsa (RF-30, RF-31)
  // ---------------------------------------------------------------------
  const resolverBolsa = useCallback(
    (sectorId, especialidadId, tipoMantenimiento) =>
      resolverOTBolsa({ sectorId, especialidadId, tipoMantenimiento, otBolsa: state.otBolsa }),
    [state.otBolsa]
  );

  // ---------------------------------------------------------------------
  // Importación JD Edwards simulada (RF-63, RF-64)
  // ---------------------------------------------------------------------
  const simularImportacionJDE = useCallback(
    (tipo) => {
      const cantidad = tipo === "OT" ? state.ordenesDeTrabajo.length : state.pedidosDeTrabajo.length;
      dispatch({
        type: "AGREGAR_IMPORT_LOG",
        entrada: {
          id: nextId("IMP"),
          tipo,
          usuario: state.usuarioActual.usuario,
          fecha_hora: nowIso(),
          cantidad_registros: cantidad,
          resultado: "Éxito (simulado — en esta demo los datos ya están precargados)",
        },
      });
    },
    [state]
  );

  // ---------------------------------------------------------------------
  // Proveedores (RF-58, RF-59): actividades realizadas por contratistas
  // ---------------------------------------------------------------------
  const registrarProveedor = useCallback(
    (datos) => {
      const registro = {
        id: nextId("PROV"),
        ...datos,
        fecha_creacion: nowIso(),
      };
      dispatch({ type: "AGREGAR_PROVEEDOR_REGISTRO", registro });
      registrarAuditoria("Alta actividad de Proveedor", `${datos.empresa_id} — OT ${datos.ot_numero}`);
      return { ok: true, registro };
    },
    [registrarAuditoria]
  );

  const agregarMaestro = useCallback(
    (tabla, item) => {
      dispatch({ type: "AGREGAR_MAESTRO", tabla, item });
      registrarAuditoria(`Alta en tabla maestra: ${tabla}`, JSON.stringify(item));
    },
    [registrarAuditoria]
  );

  const cambiarRol = useCallback((rol) => {
    const usuario = seed.usuariosDemo.find((u) => u.rol === rol) ?? seed.usuariosDemo[0];
    dispatch({ type: "SET_ROL", rol, usuario });
  }, []);

  const reiniciarDemo = useCallback(() => {
    dispatch({ type: "RESET_DEMO" });
  }, []);

  const pedidoTieneRegistro = useCallback(
    (numeroPedido) => tieneRegistroAsociado(state.historial, { numeroPedido }),
    [state.historial]
  );
  const otTieneRegistro = useCallback(
    (numeroOT) => tieneRegistroAsociado(state.historial, { numeroOT }),
    [state.historial]
  );

  const value = useMemo(
    () => ({
      state,
      actions: {
        registrarFormularioCarga,
        registrarSobrePedido,
        registrarSobreOT,
        continuarDesdeTurno,
        completarPendiente,
        resolverBolsa,
        simularImportacionJDE,
        agregarMaestro,
        registrarProveedor,
        cambiarRol,
        reiniciarDemo,
        pedidoTieneRegistro,
        otTieneRegistro,
      },
    }),
    [
      state,
      registrarFormularioCarga,
      registrarSobrePedido,
      registrarSobreOT,
      continuarDesdeTurno,
      completarPendiente,
      resolverBolsa,
      simularImportacionJDE,
      agregarMaestro,
      registrarProveedor,
      cambiarRol,
      reiniciarDemo,
      pedidoTieneRegistro,
      otTieneRegistro,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState debe usarse dentro de <AppStateProvider>.");
  return ctx;
}

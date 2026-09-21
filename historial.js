/**
 * Núcleo transaccional del SGM: creación de registros de Historial,
 * continuidad entre turnos (Pase de Turno) y completud posterior de
 * Número de OT / Número de CC.
 *
 * Referencias DRF: secciones 7 (modelo de datos), 10 (reglas de negocio),
 * 11.2 (Historial), 11.3 (Pase de Turno), 11.5/11.6 (Pedidos de Trabajo /
 * Orden de Trabajo).
 *
 * Concepto clave "id_original": cuando una intervención no se completa en
 * el turno (estado = "Pendiente"), el sistema NUNCA sobrescribe el registro:
 * genera un registro nuevo, distinto, pero que comparte el mismo
 * `id_original` que el primer registro de la cadena. Esto permite reconstruir
 * el historial completo de avances de una misma intervención, sin importar
 * si se originó en el Formulario de Carga, en un Pedido de Trabajo o en el
 * registro rápido sobre una Orden de Trabajo.
 */

import { nextId, nowIso } from "./ids.js";
import { validarOT, validarCC } from "./validaciones.js";

/**
 * Crea el primer registro de una cadena de intervención.
 * `id_original` queda igual al `id` recién generado (es la raíz de la cadena).
 */
export function crearRegistroInicial(datos) {
  const id = nextId("H");
  return {
    id,
    id_original: id,
    fecha_creacion: nowIso(),
    adjuntos: [],
    ...datos,
  };
}

/**
 * Genera un nuevo registro de continuidad a partir de uno pendiente,
 * preservando el `id_original` de toda la cadena (RF-16, RF-17, RF-38, RF-49).
 *
 * @param {Object} registroAnterior El último registro (estado "Pendiente") de la cadena.
 * @param {Object} datosNuevoAvance Los nuevos datos informados por el turno entrante.
 */
export function continuarRegistro(registroAnterior, datosNuevoAvance) {
  if (!registroAnterior) {
    throw new Error("Se requiere el registro anterior para continuar la cadena.");
  }
  return {
    ...registroAnterior,
    ...datosNuevoAvance,
    id: nextId("H"),
    id_original: registroAnterior.id_original,
    fecha_creacion: nowIso(),
    adjuntos: datosNuevoAvance.adjuntos ?? [],
  };
}

/**
 * Dado el historial completo, devuelve un único registro por cada cadena
 * (`id_original`): el más reciente según `fecha_creacion`. Representa el
 * "estado vigente" de cada intervención.
 */
export function obtenerUltimoPorCadena(historial) {
  const porCadena = new Map();
  for (const registro of historial) {
    const actual = porCadena.get(registro.id_original);
    if (!actual || new Date(registro.fecha_creacion) >= new Date(actual.fecha_creacion)) {
      porCadena.set(registro.id_original, registro);
    }
  }
  return Array.from(porCadena.values());
}

/**
 * Módulo Pase de Turno (RF-14): únicamente los registros vigentes cuyo
 * estado sea "Pendiente", sin importar su origen.
 */
export function filtrarPendientesPaseDeTurno(historial) {
  return obtenerUltimoPorCadena(historial).filter((r) => r.estado === "Pendiente");
}

/**
 * Registros vigentes que aún no tienen Número de OT y/o Número de CC
 * asignado (RF-13, KPI "Registros sin OT/CC asignada" sección 12).
 */
export function filtrarSinOTniCC(historial) {
  return obtenerUltimoPorCadena(historial).filter(
    (r) => !r.numero_ot || !r.numero_cc
  );
}

/**
 * Completa el Número de OT y/o Número de CC de un registro existente
 * (RF-39, RF-48, sección 11.5.3 / 11.6.3). A diferencia de `continuarRegistro`,
 * esto NO genera un nuevo eslabón de la cadena: es una actualización sobre
 * el mismo registro, ya que solo completa un dato pendiente.
 *
 * @param {Object} registro
 * @param {{numero_ot?: string, numero_cc?: string}} valores
 * @param {{otsImportadas: Array, otBloqueadas: Array, ccBloqueadas: Array}} ctx
 * @returns {{ ok: boolean, registro: Object|null, errores: string[] }}
 */
export function completarOTyCC(registro, valores, ctx) {
  const errores = [];
  const actualizado = { ...registro };

  if (valores.numero_ot !== undefined && valores.numero_ot !== "") {
    const resultado = validarOT(valores.numero_ot, ctx);
    if (!resultado.valido) {
      errores.push(resultado.motivo);
    } else {
      actualizado.numero_ot = valores.numero_ot.trim();
    }
  }

  if (valores.numero_cc !== undefined && valores.numero_cc !== "") {
    const resultado = validarCC(valores.numero_cc, ctx);
    if (!resultado.valido) {
      errores.push(resultado.motivo);
    } else {
      actualizado.numero_cc = valores.numero_cc.trim();
    }
  }

  if (errores.length > 0) {
    return { ok: false, registro: null, errores };
  }

  return { ok: true, registro: actualizado, errores: [] };
}

/**
 * Determina si una cadena ya tiene al menos un registro (finalizado o
 * pendiente) asociado a un Pedido de Trabajo o a una Orden de Trabajo
 * concreta. Se usa para RF-41 y RF-50 (indicador visual en los listados).
 */
export function tieneRegistroAsociado(historial, { numeroPedido, numeroOT }) {
  const vigentes = obtenerUltimoPorCadena(historial);
  if (numeroPedido) {
    return vigentes.find((r) => r.numero_pedido === numeroPedido) ?? null;
  }
  if (numeroOT) {
    return vigentes.find((r) => r.ot_numero_ref === numeroOT) ?? null;
  }
  return null;
}

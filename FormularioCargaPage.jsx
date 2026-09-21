import React, { useMemo, useState } from "react";
import { useAppState } from "../state/AppContext.jsx";
import { puedeEscribir } from "../logic/permisos.js";
import FormField from "../components/FormField.jsx";
import OperariosPicker from "../components/OperariosPicker.jsx";
import FileDropzone from "../components/FileDropzone.jsx";
import Modal from "../components/Modal.jsx";
import NoteBox from "../components/NoteBox.jsx";

const ESTADO_INICIAL = {
  fecha_inicio: "",
  hora_inicio: "",
  fecha_fin: "",
  hora_fin: "",
  equipo_id: "",
  descripcion: "",
  operarios: [],
  turno_id: "",
  tipo_mantenimiento: "",
  estado: "Finalizado",
  numero_ot: "",
  numero_cc: "",
  criticidad: "",
  numero_pedido: "",
  es_ot_bolsa: false,
  adjuntos: [],
};

export default function FormularioCargaPage() {
  const { state, actions } = useAppState();
  const soloLectura = !puedeEscribir("formularioCarga", state.rolActual);

  const [form, setForm] = useState(ESTADO_INICIAL);
  const [filtroSector, setFiltroSector] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [modalBolsaAbierto, setModalBolsaAbierto] = useState(false);
  const [bolsaEspecialidad, setBolsaEspecialidad] = useState("");
  const [bolsaTipoMant, setBolsaTipoMant] = useState("");
  const [bolsaError, setBolsaError] = useState(null);
  const [errores, setErrores] = useState([]);
  const [exito, setExito] = useState(null);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  const tiposEquipoUnicos = useMemo(
    () => Array.from(new Set(state.equipos.map((e) => e.tipo_equipo))).sort(),
    [state.equipos]
  );

  const equiposFiltrados = useMemo(
    () =>
      state.equipos.filter(
        (e) =>
          (!filtroSector || String(e.sector_id) === filtroSector) &&
          (!filtroTipo || e.tipo_equipo === filtroTipo) &&
          (!filtroTexto ||
            e.tag.toLowerCase().includes(filtroTexto.toLowerCase()) ||
            e.descripcion.toLowerCase().includes(filtroTexto.toLowerCase()))
      ),
    [state.equipos, filtroSector, filtroTipo, filtroTexto]
  );

  function abrirModalBolsa(marcado) {
    set("es_ot_bolsa", marcado);
    if (marcado) {
      if (!form.equipo_id) {
        setErrores(["Para usar OT Bolsa primero seleccioná un Equipo (se necesita determinar el Sector)."]);
        set("es_ot_bolsa", false);
        return;
      }
      setModalBolsaAbierto(true);
    }
  }

  function confirmarOTBolsa() {
    const equipo = state.equipos.find((e) => e.id === Number(form.equipo_id));
    const resultado = actions.resolverBolsa(equipo.sector_id, Number(bolsaEspecialidad), bolsaTipoMant);
    if (!resultado.encontrado) {
      setBolsaError(resultado.motivo);
      return;
    }
    set("numero_ot", resultado.numero_ot);
    set("numero_cc", resultado.numero_cc);
    set("tipo_mantenimiento", bolsaTipoMant);
    setBolsaError(null);
    setModalBolsaAbierto(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setExito(null);

    const faltantes = [];
    if (!form.fecha_inicio || !form.hora_inicio) faltantes.push("Fecha/hora de inicio");
    if (!form.fecha_fin || !form.hora_fin) faltantes.push("Fecha/hora de fin");
    if (!form.equipo_id) faltantes.push("Equipo");
    if (!form.descripcion.trim()) faltantes.push("Descripción");
    if (form.operarios.length === 0) faltantes.push("Operarios");
    if (!form.turno_id) faltantes.push("Turno");
    if (!form.tipo_mantenimiento) faltantes.push("Tipo de mantenimiento");
    if (!form.criticidad) faltantes.push("Criticidad");
    if (!form.numero_ot.trim()) faltantes.push("Número de OT");
    if (!form.numero_cc.trim()) faltantes.push("Número de CC");

    if (faltantes.length > 0) {
      setErrores([`Faltan completar campos obligatorios: ${faltantes.join(", ")}.`]);
      return;
    }

    const resultado = actions.registrarFormularioCarga({
      ...form,
      equipo_id: Number(form.equipo_id),
      turno_id: Number(form.turno_id),
    });

    if (!resultado.ok) {
      setErrores(resultado.errores);
      return;
    }

    setErrores([]);
    setExito(resultado.registro);
    setForm(ESTADO_INICIAL);
  }

  if (soloLectura) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-agdNavy mb-2">Formulario de Carga</h1>
        <NoteBox title="Acceso restringido">
          El rol <strong>{state.rolActual}</strong> no tiene permiso de escritura sobre este módulo (ver
          matriz de roles del DRF, sección 9). Cambiá al rol Administrador o Técnico desde la barra
          lateral para registrar una intervención.
        </NoteBox>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-agdNavy">Formulario de Carga</h1>
        <p className="text-sm text-gray-500">Registro manual de intervención sobre una Orden de Trabajo (RF-19 a RF-33).</p>
      </div>

      {exito && (
        <div className="bg-agdGreenLight border border-agdGreen/40 text-agdGreen rounded-lg px-4 py-3 text-sm">
          <p className="font-semibold">Intervención registrada correctamente.</p>
          <p>
            Total horas hombre: <strong>{exito.totalHorasHombre}</strong> (AGD: {exito.horasHombreAGD} · Terceros:{" "}
            {exito.horasHombreTerceros}) — {exito.cantidadOperarios} operario(s).
          </p>
        </div>
      )}

      {errores.length > 0 && (
        <div className="bg-agdRedLight border border-agdRed/40 text-agdRed rounded-lg px-4 py-3 text-sm">
          <ul className="list-disc list-inside">
            {errores.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Fecha inicio" type="date" required value={form.fecha_inicio} onChange={(v) => set("fecha_inicio", v)} />
          <FormField label="Hora inicio" type="time" required value={form.hora_inicio} onChange={(v) => set("hora_inicio", v)} />
          <FormField label="Fecha fin" type="date" required value={form.fecha_fin} onChange={(v) => set("fecha_fin", v)} />
          <FormField label="Hora fin" type="time" required value={form.hora_fin} onChange={(v) => set("hora_fin", v)} />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-gray-600 mb-2">Selección de Equipo (filtros por Sector / Tipo / texto libre)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <FormField
              label="Filtrar por Sector"
              type="select"
              value={filtroSector}
              onChange={setFiltroSector}
              options={state.sectores.map((s) => ({ value: String(s.id), label: s.nombre }))}
            />
            <FormField
              label="Filtrar por Tipo de equipo"
              type="select"
              value={filtroTipo}
              onChange={setFiltroTipo}
              options={tiposEquipoUnicos.map((t) => ({ value: t, label: t }))}
            />
            <FormField label="Buscar por texto libre" type="text" value={filtroTexto} onChange={setFiltroTexto} placeholder="Tag o descripción…" />
          </div>
          <FormField
            label="Equipo"
            type="select"
            required
            value={form.equipo_id}
            onChange={(v) => set("equipo_id", v)}
            options={equiposFiltrados.map((e) => ({ value: String(e.id), label: `${e.tag} — ${e.descripcion}` }))}
          />
        </div>

        <FormField label="Descripción del trabajo realizado" type="textarea" required value={form.descripcion} onChange={(v) => set("descripcion", v)} />

        <OperariosPicker selectedIds={form.operarios} onChange={(v) => set("operarios", v)} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            label="Turno"
            type="select"
            required
            value={form.turno_id}
            onChange={(v) => set("turno_id", v)}
            options={state.turnos.map((t) => ({ value: String(t.id), label: t.nombre }))}
          />
          <FormField
            label="Tipo de mantenimiento"
            type="select"
            required
            value={form.tipo_mantenimiento}
            onChange={(v) => set("tipo_mantenimiento", v)}
            options={["Correctivo", "Preventivo", "Predictivo"].map((t) => ({ value: t, label: t }))}
          />
          <FormField
            label="Criticidad"
            type="select"
            required
            value={form.criticidad}
            onChange={(v) => set("criticidad", v)}
            options={["Alta", "Media", "Baja"].map((c) => ({ value: c, label: c }))}
          />
        </div>

        <FormField
          label="Estado"
          type="select"
          required
          value={form.estado}
          onChange={(v) => set("estado", v)}
          options={[
            { value: "Finalizado", label: "Finalizado" },
            { value: "Pendiente", label: "Pendiente (pasa a Pase de Turno)" },
          ]}
        />

        <div className="border-t border-gray-100 pt-4">
          <FormField label="¿Es OT Bolsa?" type="checkbox" value={form.es_ot_bolsa} onChange={abrirModalBolsa} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <FormField
              label="Número de OT (7 caracteres)"
              type="text"
              required
              value={form.numero_ot}
              onChange={(v) => set("numero_ot", v)}
              placeholder="Ej: OT10001"
              help="Debe existir en el listado importado desde JD Edwards y no estar bloqueada."
            />
            <FormField
              label="Número de CC (6 caracteres)"
              type="text"
              required
              value={form.numero_cc}
              onChange={(v) => set("numero_cc", v)}
              placeholder="Ej: 700100"
            />
          </div>
        </div>

        <FormField
          label="Número de Pedido (opcional)"
          type="text"
          value={form.numero_pedido}
          onChange={(v) => set("numero_pedido", v)}
        />

        <FileDropzone adjuntos={form.adjuntos} onChange={(v) => set("adjuntos", v)} />

        <div className="pt-2">
          <button
            type="submit"
            className="bg-agdNavy text-white font-semibold rounded-lg px-5 py-2.5 hover:bg-agdBlue transition-colors"
          >
            Guardar intervención
          </button>
        </div>
      </form>

      <Modal open={modalBolsaAbierto} title="OT Bolsa" onClose={() => setModalBolsaAbierto(false)}>
        <div className="space-y-4">
          <FormField
            label="Especialidad"
            type="select"
            required
            value={bolsaEspecialidad}
            onChange={setBolsaEspecialidad}
            options={state.especialidades.map((e) => ({ value: String(e.id), label: e.nombre }))}
          />
          <FormField
            label="Tipo de Mantenimiento"
            type="select"
            required
            value={bolsaTipoMant}
            onChange={setBolsaTipoMant}
            options={["Correctivo", "Preventivo", "Predictivo"].map((t) => ({ value: t, label: t }))}
          />
          {bolsaError && <p className="text-sm text-agdRed">{bolsaError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalBolsaAbierto(false)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarOTBolsa}
              className="px-4 py-2 text-sm rounded-lg bg-agdNavy text-white hover:bg-agdBlue"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

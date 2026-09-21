import React, { useMemo, useState } from "react";
import { useAppState } from "../state/AppContext.jsx";
import { filtrarPendientesPaseDeTurno } from "../logic/historial.js";
import { puedeEscribir } from "../logic/permisos.js";
import DataTable from "../components/DataTable.jsx";
import Badge from "../components/Badge.jsx";
import Modal from "../components/Modal.jsx";
import FormField from "../components/FormField.jsx";
import OperariosPicker from "../components/OperariosPicker.jsx";
import NoteBox from "../components/NoteBox.jsx";
import { formatDateTime } from "../logic/ids.js";

const ORIGEN_LABEL = {
  "Formulario de Carga": "Formulario de Carga",
  "Registro Rápido - OT": "Registro rápido (OT)",
  "Registro Rápido - Pedido": "Registro rápido (Pedido)",
};

export default function PaseDeTurnoPage() {
  const { state, actions } = useAppState();
  const equiposPorId = useMemo(() => Object.fromEntries(state.equipos.map((e) => [e.id, e])), [state.equipos]);
  const puedeContinuar = puedeEscribir("paseDeTurno", state.rolActual);

  const pendientes = useMemo(() => filtrarPendientesPaseDeTurno(state.historial), [state.historial]);

  const [seleccionado, setSeleccionado] = useState(null);
  const [form, setForm] = useState(null);
  const [errores, setErrores] = useState([]);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function abrirContinuar(registro) {
    setSeleccionado(registro);
    setForm({
      fecha_inicio: registro.fecha_fin || "",
      hora_inicio: registro.hora_fin || "",
      fecha_fin: "",
      hora_fin: "",
      operarios: registro.operarios || [],
      descripcion: "",
      estado: "Finalizado",
    });
    setErrores([]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const faltantes = [];
    if (!form.fecha_inicio || !form.hora_inicio) faltantes.push("Fecha/hora de inicio");
    if (!form.fecha_fin || !form.hora_fin) faltantes.push("Fecha/hora de fin");
    if (form.operarios.length === 0) faltantes.push("Operarios");
    if (!form.descripcion.trim()) faltantes.push("Descripción del avance");

    if (faltantes.length > 0) {
      setErrores([`Faltan completar: ${faltantes.join(", ")}.`]);
      return;
    }

    const resultado = actions.continuarDesdeTurno(seleccionado, form);
    if (!resultado.ok) {
      setErrores(resultado.errores);
      return;
    }
    setSeleccionado(null);
  }

  const columnas = [
    { key: "numero_ot", label: "N° OT", render: (r) => r.numero_ot || <span className="text-gray-400 italic">sin asignar</span> },
    { key: "numero_cc", label: "N° CC", render: (r) => r.numero_cc || <span className="text-gray-400 italic">sin asignar</span> },
    { key: "equipo", label: "Equipo", render: (r) => equiposPorId[r.equipo_id]?.tag || "-" },
    { key: "tipo_mantenimiento", label: "Tipo Mant.", filtrable: true },
    { key: "criticidad", label: "Criticidad", filtrable: true, render: (r) => <Badge tone={r.criticidad}>{r.criticidad}</Badge> },
    { key: "descripcion", label: "Descripción" },
    { key: "origen", label: "Origen", filtrable: true, render: (r) => ORIGEN_LABEL[r.origen] || r.origen },
    { key: "fecha_creacion", label: "Último avance", render: (r) => formatDateTime(r.fecha_creacion) },
    {
      key: "acciones",
      label: "Acciones",
      render: (r) =>
        puedeContinuar ? (
          <button onClick={() => abrirContinuar(r)} className="text-xs font-semibold text-agdOrange hover:underline">
            Continuar tarea
          </button>
        ) : (
          <span className="text-xs text-gray-400">Solo lectura</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-agdNavy">Pase de Turno</h1>
        <p className="text-sm text-gray-500">
          Continuidad operativa de intervenciones pendientes (RF-14 a RF-19), sin importar su origen.
        </p>
      </div>

      <NoteBox>
        se muestran únicamente los registros con estado "Pendiente", sin importar si se originaron en el
        Formulario de Carga, en un Pedido de Trabajo o en el registro rápido sobre una Orden de Trabajo. Al
        continuar la tarea se genera un nuevo registro de Historial, preservando la trazabilidad completa
        (mismo <code>id_original</code>).
      </NoteBox>

      <DataTable columns={columnas} rows={pendientes} exportFilename="pase_de_turno" emptyMessage="No hay tareas pendientes en este momento." />

      <Modal open={!!seleccionado} title="Continuar tarea pendiente" onClose={() => setSeleccionado(null)}>
        {seleccionado && form && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
              <p>
                <strong>Equipo:</strong> {equiposPorId[seleccionado.equipo_id]?.tag} — {equiposPorId[seleccionado.equipo_id]?.descripcion}
              </p>
              <p className="text-gray-500 mt-1">Último avance: {seleccionado.descripcion}</p>
            </div>

            {errores.length > 0 && (
              <div className="bg-agdRedLight border border-agdRed/40 text-agdRed rounded-lg px-3 py-2 text-xs">
                <ul className="list-disc list-inside">
                  {errores.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Fecha inicio" type="date" required value={form.fecha_inicio} onChange={(v) => set("fecha_inicio", v)} />
              <FormField label="Hora inicio" type="time" required value={form.hora_inicio} onChange={(v) => set("hora_inicio", v)} />
              <FormField label="Fecha fin" type="date" required value={form.fecha_fin} onChange={(v) => set("fecha_fin", v)} />
              <FormField label="Hora fin" type="time" required value={form.hora_fin} onChange={(v) => set("hora_fin", v)} />
            </div>

            <OperariosPicker selectedIds={form.operarios} onChange={(v) => set("operarios", v)} />

            <FormField
              label="Estado"
              type="select"
              required
              value={form.estado}
              onChange={(v) => set("estado", v)}
              options={[
                { value: "Finalizado", label: "Finalizado" },
                { value: "Pendiente", label: "Sigue pendiente (continúa en Pase de Turno)" },
              ]}
            />

            <FormField label="Descripción del nuevo avance" type="textarea" required value={form.descripcion} onChange={(v) => set("descripcion", v)} />

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setSeleccionado(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-agdOrange text-white hover:opacity-90">
                Guardar avance
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

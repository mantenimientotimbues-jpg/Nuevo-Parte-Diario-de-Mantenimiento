import React, { useMemo, useState } from "react";
import { useAppState } from "../state/AppContext.jsx";
import { puedeCompletarOTCC } from "../logic/permisos.js";
import DataTable from "../components/DataTable.jsx";
import Badge from "../components/Badge.jsx";
import Modal from "../components/Modal.jsx";
import FormField from "../components/FormField.jsx";
import OperariosPicker from "../components/OperariosPicker.jsx";
import NoteBox from "../components/NoteBox.jsx";

const FORM_INICIAL = {
  fecha_inicio: "",
  hora_inicio: "",
  fecha_fin: "",
  hora_fin: "",
  operarios: [],
  criticidad: "",
  estado: "Finalizado",
  descripcion: "",
};

const OT_CERRADAS = ["Finalizado", "Cancelado"];

export default function OrdenDeTrabajoPage() {
  const { state, actions } = useAppState();
  const equiposPorId = useMemo(() => Object.fromEntries(state.equipos.map((e) => [e.id, e])), [state.equipos]);

  const [otSeleccionada, setOtSeleccionada] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState([]);

  const [completarRegistro, setCompletarRegistro] = useState(null);
  const [completarCC, setCompletarCC] = useState("");
  const [completarErrores, setCompletarErrores] = useState([]);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  const filas = state.ordenesDeTrabajo.map((ot) => {
    const registro = actions.otTieneRegistro(ot.numero_ot);
    return {
      ...ot,
      equipo_tag: equiposPorId[ot.equipo_id]?.tag || "-",
      estado_trabajo: registro ? registro.estado : "Sin registrar",
      registro,
      abierta: !OT_CERRADAS.includes(ot.estado),
    };
  });

  function abrirRegistro(ot) {
    setForm(FORM_INICIAL);
    setErrores([]);
    setOtSeleccionada(ot);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const faltantes = [];
    if (!form.fecha_inicio || !form.hora_inicio) faltantes.push("Fecha/hora de inicio");
    if (!form.fecha_fin || !form.hora_fin) faltantes.push("Fecha/hora de fin");
    if (form.operarios.length === 0) faltantes.push("Operarios");
    if (!form.criticidad) faltantes.push("Criticidad");
    if (!form.descripcion.trim()) faltantes.push("Descripción");

    if (faltantes.length > 0) {
      setErrores([`Faltan completar: ${faltantes.join(", ")}.`]);
      return;
    }

    const resultado = actions.registrarSobreOT(otSeleccionada.numero_ot, form);
    if (!resultado.ok) {
      setErrores(resultado.errores);
      return;
    }
    setOtSeleccionada(null);
  }

  function handleCompletar(e) {
    e.preventDefault();
    const resultado = actions.completarPendiente(completarRegistro, { numero_cc: completarCC });
    if (!resultado.ok) {
      setCompletarErrores(resultado.errores);
      return;
    }
    setCompletarRegistro(null);
    setCompletarCC("");
    setCompletarErrores([]);
  }

  const columnas = [
    { key: "numero_ot", label: "N° OT" },
    { key: "equipo_tag", label: "Equipo" },
    { key: "sector", label: "Sector", filtrable: true, render: (r) => state.sectores.find((s) => s.id === r.sector_id)?.nombre || "-" },
    { key: "descripcion", label: "Descripción" },
    { key: "estado", label: "Estado OT", filtrable: true, render: (r) => <Badge tone={r.estado}>{r.estado}</Badge> },
    { key: "prioridad", label: "Prioridad", filtrable: true, render: (r) => <Badge tone={r.prioridad}>{r.prioridad}</Badge> },
    { key: "numero_cc", label: "N° CC", render: (r) => r.numero_cc || <span className="text-gray-400 italic">sin dato JDE</span> },
    {
      key: "estado_trabajo",
      label: "Estado del trabajo",
      filtrable: true,
      render: (r) => <Badge tone={r.estado_trabajo}>{r.estado_trabajo}</Badge>,
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (r) => {
        if (!r.registro && r.abierta) {
          return (
            <button onClick={() => abrirRegistro(r)} className="text-xs font-semibold text-agdBlue hover:underline">
              Registrar trabajo
            </button>
          );
        }
        if (r.registro && !r.registro.numero_cc && puedeCompletarOTCC(state.rolActual)) {
          return (
            <button
              onClick={() => {
                setCompletarRegistro(r.registro);
                setCompletarCC("");
                setCompletarErrores([]);
              }}
              className="text-xs font-semibold text-agdPurple hover:underline"
            >
              Completar CC
            </button>
          );
        }
        if (!r.abierta && !r.registro) return <span className="text-xs text-gray-400">OT cerrada</span>;
        return <span className="text-xs text-gray-400">{r.registro ? "Completo" : "-"}</span>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-agdNavy">Orden de Trabajo</h1>
        <p className="text-sm text-gray-500">Origen: JD Edwards (solo lectura sobre la OT; RF-42 a RF-51).</p>
      </div>

      <NoteBox>
        el SGM no crea, edita ni elimina Órdenes de Trabajo. Se puede registrar el trabajo realizado sobre una
        OT abierta: el Equipo y el Número de OT ya quedan determinados por la OT seleccionada; el Número de CC
        se autocompleta si JD Edwards lo informó, o queda pendiente de completar por Supervisor/Administrador.
      </NoteBox>

      <DataTable columns={columnas} rows={filas} exportFilename="ordenes_de_trabajo" />

      <Modal open={!!otSeleccionada} title={`Registrar trabajo realizado — ${otSeleccionada?.numero_ot ?? ""}`} onClose={() => setOtSeleccionada(null)}>
        {otSeleccionada && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm space-y-0.5">
              <p>
                <strong>Equipo (autocompletado):</strong> {equiposPorId[otSeleccionada.equipo_id]?.tag} —{" "}
                {equiposPorId[otSeleccionada.equipo_id]?.descripcion}
              </p>
              <p>
                <strong>N° CC:</strong>{" "}
                {otSeleccionada.numero_cc ? (
                  <span>{otSeleccionada.numero_cc} (autocompletado desde JD Edwards)</span>
                ) : (
                  <span className="text-agdGold">no informado por JD Edwards — quedará pendiente de completar</span>
                )}
              </p>
              <p className="text-gray-500 mt-1">{otSeleccionada.descripcion}</p>
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

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Criticidad"
                type="select"
                required
                value={form.criticidad}
                onChange={(v) => set("criticidad", v)}
                options={["Alta", "Media", "Baja"].map((c) => ({ value: c, label: c }))}
              />
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
            </div>

            <FormField label="Descripción del trabajo realizado" type="textarea" required value={form.descripcion} onChange={(v) => set("descripcion", v)} />

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOtSeleccionada(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-agdNavy text-white hover:bg-agdBlue">
                Guardar
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!completarRegistro} title="Completar Número de CC" onClose={() => setCompletarRegistro(null)} widthClass="max-w-md">
        {completarRegistro && (
          <form onSubmit={handleCompletar} className="space-y-4">
            {completarErrores.length > 0 && (
              <div className="bg-agdRedLight border border-agdRed/40 text-agdRed rounded-lg px-3 py-2 text-xs">
                <ul className="list-disc list-inside">
                  {completarErrores.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-gray-500">
              OT: <strong>{completarRegistro.numero_ot}</strong> (ya determinada, no se solicita nuevamente).
            </p>
            <FormField label="Número de CC (6 caracteres)" type="text" required value={completarCC} onChange={setCompletarCC} placeholder="Ej: 700100" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setCompletarRegistro(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-agdPurple text-white hover:opacity-90">
                Confirmar
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

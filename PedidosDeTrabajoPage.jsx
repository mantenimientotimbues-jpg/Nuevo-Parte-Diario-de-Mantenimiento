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

export default function PedidosDeTrabajoPage() {
  const { state, actions } = useAppState();
  const equiposPorId = useMemo(() => Object.fromEntries(state.equipos.map((e) => [e.id, e])), [state.equipos]);

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState([]);

  const [completarRegistro, setCompletarRegistro] = useState(null);
  const [completarOT, setCompletarOT] = useState("");
  const [completarCC, setCompletarCC] = useState("");
  const [completarErrores, setCompletarErrores] = useState([]);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  const filas = state.pedidosDeTrabajo.map((p) => {
    const registro = actions.pedidoTieneRegistro(p.numero_pedido);
    return {
      ...p,
      equipo_tag: equiposPorId[p.equipo_id]?.tag || "-",
      estado_trabajo: registro ? registro.estado : "Sin registrar",
      registro,
    };
  });

  function abrirRegistro(pedido) {
    setForm(FORM_INICIAL);
    setErrores([]);
    setPedidoSeleccionado(pedido);
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

    const resultado = actions.registrarSobrePedido(pedidoSeleccionado.numero_pedido, form);
    if (!resultado.ok) {
      setErrores(resultado.errores);
      return;
    }
    setPedidoSeleccionado(null);
  }

  function handleCompletar(e) {
    e.preventDefault();
    // Regla de negocio: para registros originados en un Pedido de Trabajo,
    // el Supervisor/Administrador debe completar SIEMPRE ambos datos juntos
    // (a diferencia de Orden de Trabajo, donde solo falta el N° de CC).
    if (!completarOT.trim() || !completarCC.trim()) {
      setCompletarErrores(["Debés completar tanto el Número de OT como el Número de CC."]);
      return;
    }
    const resultado = actions.completarPendiente(completarRegistro, {
      numero_ot: completarOT,
      numero_cc: completarCC,
    });
    if (!resultado.ok) {
      setCompletarErrores(resultado.errores);
      return;
    }
    setCompletarRegistro(null);
    setCompletarOT("");
    setCompletarCC("");
    setCompletarErrores([]);
  }

  const columnas = [
    { key: "numero_pedido", label: "N° Pedido" },
    { key: "fecha", label: "Fecha", filtrable: true },
    { key: "solicitante", label: "Solicitante", filtrable: true },
    { key: "equipo_tag", label: "Equipo" },
    { key: "descripcion", label: "Descripción" },
    { key: "prioridad", label: "Prioridad", filtrable: true, render: (r) => <Badge tone={r.prioridad}>{r.prioridad}</Badge> },
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
        if (!r.registro) {
          return (
            <button onClick={() => abrirRegistro(r)} className="text-xs font-semibold text-agdBlue hover:underline">
              Registrar trabajo
            </button>
          );
        }
        const faltaOTCC = !r.registro.numero_ot || !r.registro.numero_cc;
        if (faltaOTCC && puedeCompletarOTCC(state.rolActual)) {
          return (
            <button
              onClick={() => {
                setCompletarRegistro(r.registro);
                setCompletarOT(r.registro.numero_ot || "");
                setCompletarCC(r.registro.numero_cc || "");
                setCompletarErrores([]);
              }}
              className="text-xs font-semibold text-agdPurple hover:underline"
            >
              Completar OT/CC
            </button>
          );
        }
        return <span className="text-xs text-gray-400">{faltaOTCC ? "OT/CC pendiente" : "Completo"}</span>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-agdNavy">Pedidos de Trabajo</h1>
        <p className="text-sm text-gray-500">Origen: JD Edwards (solo lectura sobre el pedido; RF-34 a RF-41).</p>
      </div>

      <NoteBox>
        el SGM no crea, edita ni elimina Pedidos de Trabajo. Se puede registrar el trabajo realizado sobre un
        pedido existente (mecánica análoga a Pase de Turno): el Equipo se autocompleta y el N° de OT / N° de CC
        quedan en blanco hasta que un Supervisor o el Administrador los completen.
      </NoteBox>

      <DataTable columns={columnas} rows={filas} exportFilename="pedidos_de_trabajo" />

      <Modal open={!!pedidoSeleccionado} title={`Registrar trabajo realizado — ${pedidoSeleccionado?.numero_pedido ?? ""}`} onClose={() => setPedidoSeleccionado(null)}>
        {pedidoSeleccionado && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
              <p>
                <strong>Equipo (autocompletado):</strong> {equiposPorId[pedidoSeleccionado.equipo_id]?.tag} —{" "}
                {equiposPorId[pedidoSeleccionado.equipo_id]?.descripcion}
              </p>
              <p className="text-gray-500 mt-1">{pedidoSeleccionado.descripcion}</p>
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

            <p className="text-xs text-gray-400">
              El Número de OT y el Número de CC no se solicitan acá: quedan en blanco hasta que un Supervisor o
              el Administrador los complete (ver sección 11.5.3 del DRF).
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setPedidoSeleccionado(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-agdNavy text-white hover:bg-agdBlue">
                Guardar
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!completarRegistro} title="Completar Número de OT / Número de CC" onClose={() => setCompletarRegistro(null)} widthClass="max-w-md">
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
            <FormField label="Número de OT (7 caracteres)" type="text" required value={completarOT} onChange={setCompletarOT} placeholder="Ej: OT10001" />
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

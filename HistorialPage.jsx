import React, { useMemo, useState } from "react";
import { useAppState } from "../state/AppContext.jsx";
import DataTable from "../components/DataTable.jsx";
import Badge from "../components/Badge.jsx";
import { formatDateTime } from "../logic/ids.js";

const ORIGEN_LABEL = {
  "Formulario de Carga": "Formulario de Carga",
  "Registro Rápido - OT": "Registro rápido (OT)",
  "Registro Rápido - Pedido": "Registro rápido (Pedido)",
};

export default function HistorialPage() {
  const { state } = useAppState();
  const [soloSinOTCC, setSoloSinOTCC] = useState(false);

  const equiposPorId = useMemo(() => Object.fromEntries(state.equipos.map((e) => [e.id, e])), [state.equipos]);
  const sectoresPorId = useMemo(() => Object.fromEntries(state.sectores.map((s) => [s.id, s.nombre])), [state.sectores]);
  const operariosPorId = useMemo(() => Object.fromEntries(state.operarios.map((o) => [o.id, o.nombre])), [state.operarios]);

  const filas = useMemo(() => {
    const base = [...state.historial].sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
    return soloSinOTCC ? base.filter((r) => !r.numero_ot || !r.numero_cc) : base;
  }, [state.historial, soloSinOTCC]);

  const columnas = [
    { key: "id", label: "ID" },
    { key: "id_original", label: "ID Original" },
    { key: "origen", label: "Origen", filtrable: true, render: (r) => ORIGEN_LABEL[r.origen] || r.origen },
    { key: "usuario_carga", label: "Usuario de carga", filtrable: true },
    { key: "fecha_inicio", label: "Fecha/Hora inicio", render: (r) => `${r.fecha_inicio || "-"} ${r.hora_inicio || ""}` },
    { key: "fecha_fin", label: "Fecha/Hora fin", render: (r) => `${r.fecha_fin || "-"} ${r.hora_fin || ""}` },
    { key: "equipo", label: "Equipo", render: (r) => equiposPorId[r.equipo_id]?.tag || "-" },
    { key: "sector", label: "Sector", filtrable: true, render: (r) => sectoresPorId[r.sector_id] || "-" },
    { key: "descripcion", label: "Descripción" },
    {
      key: "operarios",
      label: "Operarios",
      render: (r) => (r.operarios || []).map((id) => operariosPorId[id]).filter(Boolean).join(", "),
    },
    { key: "tipo_mantenimiento", label: "Tipo Mant.", filtrable: true },
    { key: "criticidad", label: "Criticidad", filtrable: true, render: (r) => <Badge tone={r.criticidad}>{r.criticidad}</Badge> },
    { key: "estado", label: "Estado", filtrable: true, render: (r) => <Badge tone={r.estado}>{r.estado}</Badge> },
    { key: "cantidadOperarios", label: "Cant. Operarios" },
    { key: "totalHorasHombre", label: "Total HH" },
    { key: "horasHombreAGD", label: "HH AGD" },
    { key: "horasHombreTerceros", label: "HH Terceros" },
    {
      key: "numero_ot",
      label: "N° OT",
      render: (r) => r.numero_ot || <span className="text-agdGold italic">sin asignar</span>,
    },
    {
      key: "numero_cc",
      label: "N° CC",
      render: (r) => r.numero_cc || <span className="text-agdGold italic">sin asignar</span>,
    },
    { key: "numero_pedido", label: "N° Pedido", render: (r) => r.numero_pedido || "-" },
    { key: "es_ot_bolsa", label: "Es OT Bolsa", render: (r) => (r.es_ot_bolsa ? "Sí" : "No") },
    { key: "adjuntos", label: "Adjuntos", render: (r) => (r.adjuntos?.length ? `${r.adjuntos.length} archivo(s)` : "-") },
    { key: "fecha_creacion", label: "Fecha de carga", render: (r) => formatDateTime(r.fecha_creacion) },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-agdNavy">Historial</h1>
        <p className="text-sm text-gray-500">
          Repositorio histórico completo de intervenciones (RF-06 a RF-13). Incluye todos los avances de cada
          cadena de continuidad, no solo el estado vigente.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={soloSinOTCC}
          onChange={(e) => setSoloSinOTCC(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-agdBlue focus:ring-agdBlue/40"
        />
        Mostrar solo registros sin Número de OT / CC asignado (RF-13)
      </label>

      <DataTable columns={columnas} rows={filas} exportFilename="historial" />
    </div>
  );
}

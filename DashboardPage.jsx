import React, { useMemo } from "react";
import { useAppState } from "../state/AppContext.jsx";
import { calcularIndicadoresDashboard } from "../logic/dashboard.js";
import { obtenerUltimoPorCadena } from "../logic/historial.js";
import KpiCard from "../components/KpiCard.jsx";
import BarChartSVG from "../components/BarChartSVG.jsx";
import DonutChartSVG from "../components/DonutChartSVG.jsx";
import NoteBox from "../components/NoteBox.jsx";
import Badge from "../components/Badge.jsx";
import { formatDateTime } from "../logic/ids.js";

const COLORES_TIPO = { Correctivo: "#A61C1C", Preventivo: "#2E7D32", Predictivo: "#2E74B5" };
const COLORES_CRITICIDAD = { Alta: "#A61C1C", Media: "#B45F06", Baja: "#2E7D32" };

export default function DashboardPage({ onNavigate }) {
  const { state } = useAppState();

  const sectoresPorId = useMemo(
    () => Object.fromEntries(state.sectores.map((s) => [s.id, s.nombre])),
    [state.sectores]
  );

  const kpi = useMemo(
    () =>
      calcularIndicadoresDashboard({
        historial: state.historial,
        ordenesDeTrabajo: state.ordenesDeTrabajo,
        sectoresPorId,
      }),
    [state.historial, state.ordenesDeTrabajo, sectoresPorId]
  );

  const ultimosRegistros = useMemo(
    () =>
      obtenerUltimoPorCadena(state.historial)
        .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
        .slice(0, 5),
    [state.historial]
  );

  const pedidosPendientes = state.pedidosDeTrabajo.filter(
    (p) => !state.historial.some((h) => h.numero_pedido === p.numero_pedido)
  );

  const equiposPorId = Object.fromEntries(state.equipos.map((e) => [e.id, e]));

  const donaTipo = kpi.trabajosPorTipo.map((d) => ({ ...d, color: COLORES_TIPO[d.label] || "#94A3B8" }));
  const donaCriticidad = kpi.trabajosPorCriticidad.map((d) => ({
    ...d,
    color: COLORES_CRITICIDAD[d.label] || "#94A3B8",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-agdNavy">Inicio</h1>
        <p className="text-sm text-gray-500">
          Planta: Timbúes · Última importación JD Edwards:{" "}
          {state.importLog[0] ? formatDateTime(state.importLog[0].fecha_hora) : "sin registrar en esta sesión"}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <KpiCard
          titulo="OT abiertas"
          valor={kpi.otAbiertas}
          subtitulo={`${kpi.otAbiertasCriticas} de prioridad Alta`}
          acento="agdBlue"
          onClick={() => onNavigate("ordenDeTrabajo")}
        />
        <KpiCard titulo="OT finalizadas" valor={kpi.otFinalizadas} acento="agdGreen" onClick={() => onNavigate("ordenDeTrabajo")} />
        <KpiCard titulo="Horas hombre acumuladas" valor={kpi.horasAcumuladas} subtitulo={`AGD: ${kpi.horasAGD} · Terceros: ${kpi.horasTerceros}`} acento="agdNavy" />
        <KpiCard titulo="Preventivos registrados" valor={kpi.preventivosRegistrados} subtitulo="No representa % de cumplimiento" acento="agdGold" />
        <KpiCard titulo="MTTR (hs. promedio)" valor={kpi.mttr} subtitulo="Correctivos finalizados" acento="agdRed" />
        <KpiCard
          titulo="Sin OT/CC asignada"
          valor={kpi.sinOTCC}
          subtitulo="Pendiente de completar"
          acento="agdPurple"
          onClick={() => onNavigate("historial")}
        />
      </div>

      <NoteBox>
        el indicador "Preventivos registrados" cuenta únicamente las intervenciones de tipo Preventivo
        efectivamente cargadas. El sistema no calcula cumplimiento/adherencia contra un plan programado,
        ya que no dispone de esa información (ver DRF, sección 12).
      </NoteBox>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <BarChartSVG
            title="Trabajos por sector"
            data={kpi.trabajosPorSector.map((d) => ({ ...d, color: "#2E74B5" }))}
          />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <DonutChartSVG title="Trabajos por tipo de mantenimiento" data={donaTipo} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <DonutChartSVG title="Trabajos por criticidad" data={donaCriticidad} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <BarChartSVG
            title="Trabajos por estado"
            data={kpi.trabajosPorEstado.map((d) => ({ ...d, color: "#8A6D00" }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-agdNavy">Últimos trabajos registrados</h2>
            <button onClick={() => onNavigate("historial")} className="text-xs text-agdBlue hover:underline">
              Ver todas →
            </button>
          </div>
          <ul className="divide-y divide-gray-100 text-sm">
            {ultimosRegistros.map((r) => (
              <li key={r.id} className="py-2 flex items-center gap-2">
                <span className="flex-1 truncate">
                  <span className="font-medium text-gray-700">{equiposPorId[r.equipo_id]?.tag}</span>{" "}
                  <span className="text-gray-500">— {r.descripcion}</span>
                </span>
                <Badge>{r.estado}</Badge>
              </li>
            ))}
            {ultimosRegistros.length === 0 && <li className="text-gray-400 italic py-4">Sin registros aún.</li>}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-agdNavy">Pedidos de Trabajo (Origen: JD Edwards)</h2>
            <button onClick={() => onNavigate("pedidosDeTrabajo")} className="text-xs text-agdBlue hover:underline">
              Ver todos →
            </button>
          </div>
          <ul className="divide-y divide-gray-100 text-sm">
            {pedidosPendientes.slice(0, 5).map((p) => (
              <li key={p.numero_pedido} className="py-2 flex items-center gap-2">
                <span className="flex-1 truncate">
                  <span className="font-medium text-gray-700">{p.numero_pedido}</span>{" "}
                  <span className="text-gray-500">— {p.descripcion}</span>
                </span>
                <Badge tone={p.prioridad}>{p.prioridad}</Badge>
              </li>
            ))}
            {pedidosPendientes.length === 0 && (
              <li className="text-gray-400 italic py-4">No hay pedidos sin gestionar.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

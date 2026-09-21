import React from "react";
import { calcularSegmentosDona } from "../logic/charts.js";

// Con este radio la circunferencia del círculo es ≈ 100 unidades, lo que
// permite expresar stroke-dasharray/offset directamente como porcentajes
// (técnica estándar para gráficos de dona en SVG puro, sin librerías).
const RADIO = 15.9155;

/**
 * Gráfico de dona en SVG puro (sin librerías externas).
 * @param {{ data: Array<{label:string, value:number, color:string}>, title?: string }} props
 */
export default function DonutChartSVG({ data, title }) {
  const segmentos = calcularSegmentosDona(data);

  return (
    <div className="w-full flex flex-col items-center">
      {title && <p className="text-sm font-semibold text-gray-600 mb-2 self-start">{title}</p>}
      {segmentos.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-8">Sin datos para graficar.</p>
      ) : (
        <div className="flex items-center gap-4 w-full">
          <svg viewBox="0 0 36 36" className="w-28 h-28 flex-shrink-0">
            <circle cx="18" cy="18" r={RADIO} fill="none" stroke="#E5E7EB" strokeWidth="4.2" />
            {segmentos.map((s) => (
              <circle
                key={s.label}
                cx="18"
                cy="18"
                r={RADIO}
                fill="none"
                stroke={s.color}
                strokeWidth="4.2"
                strokeDasharray={`${s.porcentaje} ${100 - s.porcentaje}`}
                strokeDashoffset={25 - s.offset}
                strokeLinecap="butt"
              />
            ))}
          </svg>
          <ul className="text-xs space-y-1 flex-1">
            {segmentos.map((s) => (
              <li key={s.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-gray-600">{s.label}</span>
                <span className="ml-auto font-semibold text-gray-700">
                  {s.value} ({Math.round(s.porcentaje)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

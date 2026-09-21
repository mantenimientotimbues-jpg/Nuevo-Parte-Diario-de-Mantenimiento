import React from "react";

/**
 * Gráfico de barras simple, en SVG puro (sin librerías externas).
 * @param {{ data: Array<{label:string, value:number, color?:string}>, height?: number }} props
 */
export default function BarChartSVG({ data, height = 180, title }) {
  const items = Array.isArray(data) ? data : [];
  const max = Math.max(1, ...items.map((d) => d.value));
  const barWidth = 100 / Math.max(items.length, 1);

  return (
    <div className="w-full">
      {title && <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>}
      <svg viewBox={`0 0 100 ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        {items.map((d, i) => {
          const barHeight = (d.value / max) * (height - 24);
          const x = i * barWidth + barWidth * 0.15;
          const w = barWidth * 0.7;
          const y = height - 24 - barHeight;
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={w} height={barHeight} rx={1} fill={d.color || "#2E74B5"} />
              <text
                x={x + w / 2}
                y={height - 24 - barHeight - 3}
                textAnchor="middle"
                fontSize="5"
                fill="#374151"
                fontWeight="600"
              >
                {d.value}
              </text>
              <text x={x + w / 2} y={height - 8} textAnchor="middle" fontSize="4.3" fill="#6B7280">
                {d.label.length > 12 ? d.label.slice(0, 11) + "…" : d.label}
              </text>
            </g>
          );
        })}
      </svg>
      {items.length === 0 && <p className="text-xs text-gray-400 italic">Sin datos para graficar.</p>}
    </div>
  );
}

import React from "react";

/**
 * Tarjeta de indicador (KPI) del Dashboard (DRF sección 12.1/12.2).
 *
 * Nota técnica: Tailwind necesita que las clases aparezcan como strings
 * completos en el código fuente para poder detectarlas (no admite
 * interpolación tipo `text-${variable}`). Por eso se usa este mapa con
 * las clases ya resueltas por color, en vez de armarlas dinámicamente.
 */
const ACENTOS = {
  agdBlue: { texto: "text-agdBlue", borde: "hover:border-agdBlue" },
  agdGreen: { texto: "text-agdGreen", borde: "hover:border-agdGreen" },
  agdGold: { texto: "text-agdGold", borde: "hover:border-agdGold" },
  agdRed: { texto: "text-agdRed", borde: "hover:border-agdRed" },
  agdPurple: { texto: "text-agdPurple", borde: "hover:border-agdPurple" },
  agdNavy: { texto: "text-agdNavy", borde: "hover:border-agdNavy" },
};

export default function KpiCard({ titulo, valor, subtitulo, acento = "agdBlue", onClick }) {
  const clases = ACENTOS[acento] || ACENTOS.agdBlue;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 min-w-[160px] transition-shadow ${clases.borde} ${
        onClick ? "cursor-pointer hover:shadow-md" : "cursor-default"
      }`}
    >
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{titulo}</p>
      <p className={`text-3xl font-bold mt-1 ${clases.texto}`}>{valor}</p>
      {subtitulo && <p className="text-xs text-gray-400 mt-1">{subtitulo}</p>}
    </button>
  );
}

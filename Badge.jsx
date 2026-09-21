import React from "react";

/**
 * Pastilla de estado, con colores consistentes en toda la aplicación.
 * Reutilizado en Historial, Pase de Turno, Pedidos de Trabajo y Orden de Trabajo.
 */
const ESTILOS = {
  Pendiente: "bg-agdGoldLight text-agdGold border border-agdGold/40",
  Finalizado: "bg-agdGreenLight text-agdGreen border border-agdGreen/40",
  "En Proceso": "bg-agdBlueLight text-agdBlue border border-agdBlue/40",
  Abierta: "bg-agdBlueLight text-agdBlue border border-agdBlue/40",
  Cancelado: "bg-gray-200 text-gray-600 border border-gray-400/40",
  Alta: "bg-agdRedLight text-agdRed border border-agdRed/40",
  Media: "bg-agdOrangeLight text-agdOrange border border-agdOrange/40",
  Baja: "bg-agdGreenLight text-agdGreen border border-agdGreen/40",
  "Sin registrar": "bg-gray-100 text-gray-500 border border-gray-300",
};

export default function Badge({ children, tone }) {
  const clase = ESTILOS[tone ?? children] || "bg-gray-100 text-gray-600 border border-gray-300";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${clase}`}>
      {children}
    </span>
  );
}

/**
 * Agregación del módulo Horas Administradas (DRF: RF-55 a RF-57, sección 11.8).
 * Consolida las horas imputadas por OT + Cuenta Corta, junto con su
 * porcentaje sobre el total del período filtrado.
 */
import { obtenerUltimoPorCadena } from "./historial.js";

/**
 * @param {Object} params
 * @param {Array} params.historial
 * @param {string} [params.fechaDesde] "YYYY-MM-DD"
 * @param {string} [params.fechaHasta] "YYYY-MM-DD"
 * @returns {Array<{numero_ot:string, numero_cc:string, horas:number, porcentaje:number}>}
 */
export function agregarHorasAdministradas({ historial, fechaDesde, fechaHasta }) {
  let vigentes = obtenerUltimoPorCadena(historial).filter((r) => r.numero_ot && r.numero_cc);

  if (fechaDesde) vigentes = vigentes.filter((r) => r.fecha_inicio >= fechaDesde);
  if (fechaHasta) vigentes = vigentes.filter((r) => r.fecha_inicio <= fechaHasta);

  const totalHoras = vigentes.reduce((acc, r) => acc + (r.totalHorasHombre || 0), 0);

  const grupos = new Map();
  for (const r of vigentes) {
    const clave = `${r.numero_ot}|${r.numero_cc}`;
    const actual = grupos.get(clave) || { numero_ot: r.numero_ot, numero_cc: r.numero_cc, horas: 0 };
    actual.horas += r.totalHorasHombre || 0;
    grupos.set(clave, actual);
  }

  return Array.from(grupos.values())
    .map((g) => ({
      ...g,
      horas: Math.round(g.horas * 100) / 100,
      porcentaje: totalHoras === 0 ? 0 : Math.round((g.horas / totalHoras) * 10000) / 100,
    }))
    .sort((a, b) => b.horas - a.horas);
}

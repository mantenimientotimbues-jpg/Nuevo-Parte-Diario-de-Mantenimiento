/**
 * Cálculos puros para los gráficos SVG (torta / dona) del Dashboard.
 * Separado de los componentes React para poder testearlo con Node directo.
 */

/**
 * Dado un arreglo [{ label, value, color }], devuelve los segmentos con su
 * porcentaje y el offset acumulado (en unidades de circunferencia 0-100),
 * listos para usarse como `stroke-dasharray` / `stroke-dashoffset` en un
 * gráfico de dona SVG.
 */
export function calcularSegmentosDona(data) {
  const items = Array.isArray(data) ? data.filter((d) => d.value > 0) : [];
  const total = items.reduce((acc, d) => acc + d.value, 0);
  if (total === 0) return [];

  let acumulado = 0;
  return items.map((d) => {
    const porcentaje = (d.value / total) * 100;
    const segmento = { ...d, porcentaje, offset: acumulado, total };
    acumulado += porcentaje;
    return segmento;
  });
}

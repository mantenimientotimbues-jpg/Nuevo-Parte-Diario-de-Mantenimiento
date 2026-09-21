/**
 * Cálculo de los indicadores del Dashboard (DRF sección 12.1).
 *
 * Simplificación de prototipo: no hay selector de período (mes/trimestre/
 * año) todavía; los indicadores se calculan sobre la totalidad de los datos
 * en memoria. La lógica de agrupamiento es la misma que usaría un backend
 * real, por lo que agregar el filtro de fechas más adelante es directo.
 */

import { obtenerUltimoPorCadena, filtrarSinOTniCC } from "./historial.js";

function agruparPor(lista, campo, etiquetas = {}) {
  const conteo = new Map();
  for (const item of lista) {
    const clave = item[campo] ?? "Sin dato";
    conteo.set(clave, (conteo.get(clave) || 0) + 1);
  }
  return Array.from(conteo.entries()).map(([clave, value]) => ({
    label: etiquetas[clave] ?? String(clave),
    value,
  }));
}

/**
 * @param {Object} ctx
 * @param {Array} ctx.historial
 * @param {Array} ctx.ordenesDeTrabajo Listado de OT importadas de JDE
 * @param {Map|Object} ctx.sectoresPorId Mapa id -> nombre de sector
 */
export function calcularIndicadoresDashboard({ historial, ordenesDeTrabajo, sectoresPorId = {} }) {
  const vigentes = obtenerUltimoPorCadena(historial);

  const otAbiertas = ordenesDeTrabajo.filter((o) => o.estado === "Abierta" || o.estado === "En Proceso");
  const otCriticasVencidas = otAbiertas.filter((o) => o.prioridad === "Alta");
  const otFinalizadas = ordenesDeTrabajo.filter((o) => o.estado === "Finalizado");

  const horasAcumuladas = vigentes.reduce((acc, r) => acc + (r.totalHorasHombre || 0), 0);
  const horasAGD = vigentes.reduce((acc, r) => acc + (r.horasHombreAGD || 0), 0);
  const horasTerceros = vigentes.reduce((acc, r) => acc + (r.horasHombreTerceros || 0), 0);

  const preventivosRegistrados = vigentes.filter((r) => r.tipo_mantenimiento === "Preventivo").length;

  const sinOTCC = filtrarSinOTniCC(historial).length;

  const correctivosFinalizados = vigentes.filter(
    (r) => r.tipo_mantenimiento === "Correctivo" && r.estado === "Finalizado" && r.cantidadOperarios > 0
  );
  const mttr =
    correctivosFinalizados.length === 0
      ? 0
      : Math.round(
          (correctivosFinalizados.reduce(
            (acc, r) => acc + r.totalHorasHombre / r.cantidadOperarios,
            0
          ) /
            correctivosFinalizados.length) *
            100
        ) / 100;

  const vigentesConSector = vigentes.map((r) => ({
    ...r,
    sector_nombre: sectoresPorId[r.sector_id] || "Sin sector",
  }));

  return {
    otAbiertas: otAbiertas.length,
    otAbiertasCriticas: otCriticasVencidas.length,
    otFinalizadas: otFinalizadas.length,
    horasAcumuladas: Math.round(horasAcumuladas * 100) / 100,
    horasAGD: Math.round(horasAGD * 100) / 100,
    horasTerceros: Math.round(horasTerceros * 100) / 100,
    preventivosRegistrados,
    sinOTCC,
    mttr,
    trabajosPorCriticidad: agruparPor(vigentes, "criticidad"),
    trabajosPorSector: agruparPor(vigentesConSector, "sector_nombre"),
    trabajosPorTipo: agruparPor(vigentes, "tipo_mantenimiento"),
    trabajosPorEstado: agruparPor(vigentes, "estado"),
  };
}

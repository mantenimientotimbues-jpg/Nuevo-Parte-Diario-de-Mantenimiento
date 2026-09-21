/**
 * Cálculo automático de horas hombre (DRF: RF-25, sección 11.4.5).
 *
 * Regla de negocio: el sistema debe calcular automáticamente el total de horas
 * hombre, las horas hombre AGD (personal propio) y las horas hombre de terceros
 * (personal contratista), en función de los operarios seleccionados, sus
 * empresas y los tramos horarios informados.
 */

import { toDateTime } from "./ids.js";

/**
 * @param {Object} params
 * @param {string} params.fechaInicio  "YYYY-MM-DD"
 * @param {string} params.horaInicio   "HH:MM"
 * @param {string} params.fechaFin     "YYYY-MM-DD"
 * @param {string} params.horaFin      "HH:MM"
 * @param {Array}  params.operarios    Lista de operarios seleccionados, cada uno
 *                                     con la forma { id, empresaTipo: 'propia' | 'tercero' }
 * @returns {{
 *   duracionHoras: number,
 *   cantidadOperarios: number,
 *   totalHorasHombre: number,
 *   horasHombreAGD: number,
 *   horasHombreTerceros: number,
 *   error: string|null
 * }}
 */
export function calcularHoras({ fechaInicio, horaInicio, fechaFin, horaFin, operarios }) {
  const inicio = toDateTime(fechaInicio, horaInicio);
  const fin = toDateTime(fechaFin, horaFin);

  if (!inicio || !fin) {
    return {
      duracionHoras: 0,
      cantidadOperarios: operarios?.length ?? 0,
      totalHorasHombre: 0,
      horasHombreAGD: 0,
      horasHombreTerceros: 0,
      error: "Fechas/horas incompletas o inválidas.",
    };
  }

  if (fin.getTime() < inicio.getTime()) {
    return {
      duracionHoras: 0,
      cantidadOperarios: operarios?.length ?? 0,
      totalHorasHombre: 0,
      horasHombreAGD: 0,
      horasHombreTerceros: 0,
      error: "La fecha/hora de fin no puede ser anterior a la de inicio.",
    };
  }

  const duracionHoras = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
  const lista = Array.isArray(operarios) ? operarios : [];
  const cantidadOperarios = lista.length;

  const cantidadPropios = lista.filter((o) => o.empresaTipo === "propia").length;
  const cantidadTerceros = lista.filter((o) => o.empresaTipo === "tercero").length;

  const round2 = (n) => Math.round(n * 100) / 100;

  return {
    duracionHoras: round2(duracionHoras),
    cantidadOperarios,
    totalHorasHombre: round2(duracionHoras * cantidadOperarios),
    horasHombreAGD: round2(duracionHoras * cantidadPropios),
    horasHombreTerceros: round2(duracionHoras * cantidadTerceros),
    error: null,
  };
}

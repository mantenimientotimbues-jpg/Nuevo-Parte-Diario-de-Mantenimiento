/**
 * Funcionalidad "OT Bolsa" (DRF: RF-30, RF-31, sección 11.4.7).
 *
 * Dado el Sector (determinado por el equipo seleccionado), la Especialidad
 * y el Tipo de Mantenimiento informados en el modal, se consulta la tabla
 * maestra OT_Bolsa y se devuelve el Número de OT y Número de CC a autocompletar.
 */

/**
 * @param {Object} params
 * @param {string|number} params.sectorId
 * @param {string|number} params.especialidadId
 * @param {string} params.tipoMantenimiento  "Correctivo" | "Preventivo" | "Predictivo"
 * @param {Array}  params.otBolsa Lista maestra OT_Bolsa
 * @returns {{ encontrado: boolean, numero_ot: string|null, numero_cc: string|null, motivo: string|null }}
 */
export function resolverOTBolsa({ sectorId, especialidadId, tipoMantenimiento, otBolsa }) {
  const lista = Array.isArray(otBolsa) ? otBolsa : [];

  const coincidencia = lista.find(
    (item) =>
      String(item.sector_id) === String(sectorId) &&
      String(item.especialidad_id) === String(especialidadId) &&
      item.tipo_mantenimiento === tipoMantenimiento
  );

  if (!coincidencia) {
    return {
      encontrado: false,
      numero_ot: null,
      numero_cc: null,
      motivo:
        "No existe una combinación de OT Bolsa configurada para ese sector, especialidad y tipo de mantenimiento.",
    };
  }

  return {
    encontrado: true,
    numero_ot: coincidencia.numero_ot,
    numero_cc: coincidencia.numero_cc,
    motivo: null,
  };
}

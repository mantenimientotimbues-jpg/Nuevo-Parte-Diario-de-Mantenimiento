/**
 * Validaciones de negocio del SGM (DRF: RF-26 a RF-29, RF-32, RF-33, sección 10).
 *
 * Todas las funciones son puras: reciben los datos a validar más las listas
 * maestras/importadas necesarias, y devuelven un resultado homogéneo
 * { valido: boolean, motivo: string|null, ...datosExtra }.
 * Esto permite reutilizarlas tanto en el frontend (feedback inmediato al
 * usuario) como en un futuro backend real (la validación NUNCA debe confiar
 * únicamente en el frontend).
 */

const LONGITUD_OT = 7;
const LONGITUD_CC = 6;

/** Tipos de archivo admitidos (RNF-15) */
export const TIPOS_ADJUNTOS_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
];

export const TAMANO_MAXIMO_ADJUNTO_BYTES = 20 * 1024 * 1024; // 20 MB (RNF-15)
export const MAX_ADJUNTOS_POR_REGISTRO = 5; // RNF-15

/**
 * Valida un Número de Orden de Trabajo contra el listado importado de JD Edwards
 * y contra el maestro de OT Bloqueadas (RF-26, RF-27).
 *
 * @param {string} numeroOT
 * @param {{ otsImportadas: Array<{numero_ot:string}>, otBloqueadas: Array<{numero_ot:string, motivo:string}> }} ctx
 */
export function validarOT(numeroOT, ctx) {
  const { otsImportadas = [], otBloqueadas = [] } = ctx || {};
  const valor = (numeroOT || "").trim();

  if (valor.length !== LONGITUD_OT) {
    return { valido: false, motivo: `El Número de OT debe tener ${LONGITUD_OT} caracteres.` };
  }

  const ot = otsImportadas.find((o) => o.numero_ot === valor);
  if (!ot) {
    return {
      valido: false,
      motivo: "El Número de OT no existe en el listado importado desde JD Edwards.",
    };
  }

  const bloqueo = otBloqueadas.find((b) => b.numero_ot === valor);
  if (bloqueo) {
    return {
      valido: false,
      motivo: `La OT se encuentra bloqueada (motivo: ${bloqueo.motivo}).`,
    };
  }

  return { valido: true, motivo: null, ot };
}

/**
 * Valida un Número de Cuenta Corta contra el maestro de CC Bloqueadas (RF-28, RF-29).
 * A diferencia de la OT, el Número de CC no siempre proviene de un listado
 * importado (puede ser tipeado en el Formulario de Carga), por lo que solo
 * se valida longitud y bloqueo.
 *
 * @param {string} numeroCC
 * @param {{ ccBloqueadas: Array<{numero_cc:string, motivo:string}> }} ctx
 */
export function validarCC(numeroCC, ctx) {
  const { ccBloqueadas = [] } = ctx || {};
  const valor = (numeroCC || "").trim();

  if (valor.length !== LONGITUD_CC) {
    return { valido: false, motivo: `El Número de CC debe tener ${LONGITUD_CC} caracteres.` };
  }

  const bloqueo = ccBloqueadas.find((b) => b.numero_cc === valor);
  if (bloqueo) {
    return {
      valido: false,
      motivo: `La Cuenta Corta se encuentra bloqueada (motivo: ${bloqueo.motivo}).`,
    };
  }

  return { valido: true, motivo: null };
}

/**
 * Valida un archivo adjunto del Formulario de Carga (RF-32, RF-33, RNF-15).
 * @param {{name:string, type:string, size:number}} archivo
 * @param {number} cantidadActual Cantidad de adjuntos ya presentes en el registro
 */
export function validarArchivoAdjunto(archivo, cantidadActual = 0) {
  if (!archivo) return { valido: false, motivo: "No se seleccionó ningún archivo." };

  if (cantidadActual >= MAX_ADJUNTOS_POR_REGISTRO) {
    return {
      valido: false,
      motivo: `Ya se alcanzó el máximo de ${MAX_ADJUNTOS_POR_REGISTRO} archivos por registro.`,
    };
  }

  if (archivo.size > TAMANO_MAXIMO_ADJUNTO_BYTES) {
    return {
      valido: false,
      motivo: `El archivo supera el tamaño máximo permitido de 20 MB.`,
    };
  }

  if (archivo.type && !TIPOS_ADJUNTOS_PERMITIDOS.includes(archivo.type)) {
    return {
      valido: false,
      motivo: "Formato de archivo no admitido (se admiten JPG, PNG, PDF, DOCX, XLSX).",
    };
  }

  return { valido: true, motivo: null };
}

export const LONGITUDES = { OT: LONGITUD_OT, CC: LONGITUD_CC };

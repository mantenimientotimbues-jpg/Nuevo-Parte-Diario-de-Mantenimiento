/**
 * Utilidades de identificadores y fechas para el prototipo del SGM.
 * No dependen de React ni de ninguna librería externa: son funciones puras,
 * fáciles de testear con `node --test` y de reutilizar en un futuro backend real.
 */

let counter = 1000;

/**
 * Genera un identificador incremental simple (simula un id autoincremental de base de datos).
 * En un backend real esto sería reemplazado por el id generado por SQL Server/PostgreSQL.
 */
export function nextId(prefix = "") {
  counter += 1;
  return prefix ? `${prefix}-${counter}` : String(counter);
}

/** Permite resetear el contador (usado solo en tests, para resultados predecibles). */
export function _resetIdCounterForTests(value = 1000) {
  counter = value;
}

/**
 * Combina fecha (YYYY-MM-DD) y hora (HH:MM) en un objeto Date.
 * Devuelve `null` si falta alguno de los dos valores.
 */
export function toDateTime(fecha, hora) {
  if (!fecha || !hora) return null;
  const dt = new Date(`${fecha}T${hora}:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/** Formatea un Date a "DD/MM/AAAA HH:MM" para mostrar en pantalla. */
export function formatDateTime(date) {
  if (!date) return "-";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/** Fecha/hora actual en formato ISO simple, usado como timestamp de auditoría. */
export function nowIso() {
  return new Date().toISOString();
}

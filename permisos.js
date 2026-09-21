/**
 * Matriz de permisos por rol (DRF sección 9.2). Se modela como funciones
 * puras para poder testearla y para que la interfaz (menú lateral, botones
 * de acción) se adapte automáticamente al rol activo, sin lógica dispersa.
 *
 * Nota: en esta demo no hay backend de autenticación real; el "rol activo"
 * se simula desde un selector en la barra lateral (ver Sidebar.jsx) para
 * poder mostrar el comportamiento de RBAC descrito en el DRF.
 */

export const ROLES = ["Administrador", "Supervisor", "Técnico", "Consulta"];

const MATRIZ = {
  dashboard: { Administrador: "RW", Supervisor: "R", Técnico: "R", Consulta: "R" },
  historial: { Administrador: "RW", Supervisor: "R", Técnico: "R", Consulta: "R" },
  paseDeTurno: { Administrador: "RW", Supervisor: "R", Técnico: "RW", Consulta: "-" },
  formularioCarga: { Administrador: "RW", Supervisor: "R", Técnico: "RW", Consulta: "-" },
  pedidosDeTrabajo: { Administrador: "RW", Supervisor: "RW", Técnico: "RW", Consulta: "R" },
  ordenDeTrabajo: { Administrador: "RW", Supervisor: "RW", Técnico: "RW", Consulta: "R" },
  equipos: { Administrador: "RW", Supervisor: "R", Técnico: "R", Consulta: "R" },
  horasAdministradas: { Administrador: "RW", Supervisor: "R", Técnico: "-", Consulta: "R" },
  proveedores: { Administrador: "RW", Supervisor: "R", Técnico: "RW", Consulta: "-" },
  configuracion: { Administrador: "RW", Supervisor: "-", Técnico: "-", Consulta: "-" },
};

/** Devuelve "RW", "R" o "-" para un módulo y un rol determinados. */
export function nivelAcceso(modulo, rol) {
  return MATRIZ[modulo]?.[rol] ?? "-";
}

/** ¿El rol puede al menos ver (leer) el módulo? */
export function puedeVer(modulo, rol) {
  return nivelAcceso(modulo, rol) !== "-";
}

/** ¿El rol puede escribir/registrar dentro del módulo? */
export function puedeEscribir(modulo, rol) {
  return nivelAcceso(modulo, rol) === "RW";
}

/**
 * Reglas puntuales que no son un simple R/W, tal como quedaron definidas en
 * el DRF (secciones 9.1, 11.5.3 y 11.6.3):
 *  - Completar N° OT / N° CC pendiente: exclusivo de Supervisor y Administrador.
 *  - Configuración / Importación JDE: exclusivo de Administrador.
 */
export function puedeCompletarOTCC(rol) {
  return rol === "Supervisor" || rol === "Administrador";
}

export function puedeImportarJDE(rol) {
  return rol === "Administrador";
}

export function puedeAdministrarMaestros(rol) {
  return rol === "Administrador";
}

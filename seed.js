/**
 * Datos semilla (mock) del prototipo del SGM.
 *
 * Simulan:
 *  - Tablas maestras propias del SGM (Sectores, Empresas, Especialidades,
 *    Turnos, Operarios, Equipos, OT Bolsa, OT/CC Bloqueadas).
 *  - Tablas "importadas" desde JD Edwards, en modo de solo lectura
 *    (Órdenes de Trabajo y Pedidos de Trabajo).
 *
 * En la implementación real, las dos últimas se cargan mediante el módulo
 * de Importación JD Edwards (RF-63, RF-64); acá se simulan con datos fijos
 * para poder demostrar el flujo funcional completo sin backend.
 */

export const sectores = [
  { id: 1, nombre: "Extracción" },
  { id: 2, nombre: "Molienda" },
  { id: 3, nombre: "Refinería" },
  { id: 4, nombre: "Envasado" },
  { id: 5, nombre: "Playa de Tanques" },
  { id: 6, nombre: "Servicios Generales" },
];

export const empresas = [
  { id: 1, razon_social: "AGD S.A. (Personal Propio)", tipo: "propia", cuit: "30-50000000-1" },
  { id: 2, razon_social: "ServiMant SRL", tipo: "tercero", cuit: "30-71111111-2" },
  { id: 3, razon_social: "Electromec Rosario S.A.", tipo: "tercero", cuit: "30-72222222-3" },
  { id: 4, razon_social: "Instrumental del Litoral SRL", tipo: "tercero", cuit: "30-73333333-4" },
];

export const especialidades = [
  { id: 1, nombre: "Mecánico" },
  { id: 2, nombre: "Eléctrico" },
  { id: 3, nombre: "Lubricación" },
  { id: 4, nombre: "Instrumentación" },
];

export const turnos = [
  { id: 1, nombre: "Turno Mañana", hora_inicio: "06:00", hora_fin: "14:00" },
  { id: 2, nombre: "Turno Tarde", hora_inicio: "14:00", hora_fin: "22:00" },
  { id: 3, nombre: "Turno Noche", hora_inicio: "22:00", hora_fin: "06:00" },
  { id: 4, nombre: "Turno Central", hora_inicio: "08:00", hora_fin: "17:00" },
];

export const operarios = [
  { id: 1, nombre: "Ramírez, Carlos", empresa_id: 1, especialidad_id: 1, turno_id: 1, activo: true },
  { id: 2, nombre: "Gómez, Lucas", empresa_id: 1, especialidad_id: 2, turno_id: 1, activo: true },
  { id: 3, nombre: "Fernández, Ana", empresa_id: 1, especialidad_id: 4, turno_id: 4, activo: true },
  { id: 4, nombre: "Britos, Marcelo", empresa_id: 1, especialidad_id: 3, turno_id: 2, activo: true },
  { id: 5, nombre: "Suárez, Diego", empresa_id: 2, especialidad_id: 1, turno_id: 1, activo: true },
  { id: 6, nombre: "Paz, Emiliano", empresa_id: 2, especialidad_id: 1, turno_id: 2, activo: true },
  { id: 7, nombre: "Ibáñez, Romina", empresa_id: 3, especialidad_id: 2, turno_id: 1, activo: true },
  { id: 8, nombre: "Correa, Franco", empresa_id: 4, especialidad_id: 4, turno_id: 4, activo: true },
  { id: 9, nombre: "Ledesma, Pablo", empresa_id: 1, especialidad_id: 1, turno_id: 3, activo: true },
  { id: 10, nombre: "Acosta, Yamila", empresa_id: 1, especialidad_id: 2, turno_id: 3, activo: true },
];

export const equipos = [
  { id: 1, tag: "EXT-PRE-01", descripcion: "Prensa Continua N°1", sector_id: 1, tipo_equipo: "Prensa", ubicacion: "Nave Extracción - Línea 1", criticidad: "Alta", estado: "Operativo" },
  { id: 2, tag: "EXT-ROT-02", descripcion: "Extractor Rotocel N°2", sector_id: 1, tipo_equipo: "Extractor", ubicacion: "Nave Extracción - Línea 2", criticidad: "Alta", estado: "Operativo" },
  { id: 3, tag: "MOL-CIN-04", descripcion: "Cinta Transportadora Norte", sector_id: 2, tipo_equipo: "Transporte", ubicacion: "Molienda - Sector Norte", criticidad: "Media", estado: "Operativo" },
  { id: 4, tag: "MOL-DES-01", descripcion: "Descascarador N°1", sector_id: 2, tipo_equipo: "Descascarador", ubicacion: "Molienda - Planta Baja", criticidad: "Alta", estado: "Operativo" },
  { id: 5, tag: "REF-CAL-02", descripcion: "Caldera N°2", sector_id: 3, tipo_equipo: "Caldera", ubicacion: "Refinería - Sala de Calderas", criticidad: "Alta", estado: "Operativo" },
  { id: 6, tag: "REF-BOM-07", descripcion: "Bomba Centrífuga 07", sector_id: 3, tipo_equipo: "Bomba", ubicacion: "Refinería - Línea de Proceso", criticidad: "Media", estado: "En Mantenimiento" },
  { id: 7, tag: "ENV-LLE-03", descripcion: "Llenadora Automática N°3", sector_id: 4, tipo_equipo: "Llenadora", ubicacion: "Envasado - Línea 3", criticidad: "Media", estado: "Operativo" },
  { id: 8, tag: "ENV-ETI-01", descripcion: "Etiquetadora N°1", sector_id: 4, tipo_equipo: "Etiquetadora", ubicacion: "Envasado - Línea 1", criticidad: "Baja", estado: "Operativo" },
  { id: 9, tag: "TAN-TQ-12", descripcion: "Tanque de Almacenamiento 12", sector_id: 5, tipo_equipo: "Tanque", ubicacion: "Playa de Tanques - Batería B", criticidad: "Alta", estado: "Operativo" },
  { id: 10, tag: "SSGG-COM-01", descripcion: "Compresor de Aire N°1", sector_id: 6, tipo_equipo: "Compresor", ubicacion: "Sala de Máquinas Central", criticidad: "Media", estado: "Operativo" },
];

/**
 * Órdenes de Trabajo "importadas desde JD Edwards".
 * Nota: `equipo_id` y `numero_cc` representan los casos en que JDE informa
 * (o no) esos datos junto con la OT — ver RF-46 y RF-48 del DRF.
 */
export const ordenesDeTrabajoJDE = [
  { numero_ot: "OT10001", descripcion: "Vibración anormal en rodamientos", equipo_id: 1, sector_id: 1, estado: "Abierta", prioridad: "Alta", numero_cc: "710010", fecha_creacion: "2026-09-15" },
  { numero_ot: "OT10002", descripcion: "Pérdida de aceite en reductor", equipo_id: 2, sector_id: 1, estado: "Abierta", prioridad: "Media", numero_cc: null, fecha_creacion: "2026-09-16" },
  { numero_ot: "OT10003", descripcion: "Rotura de cinta transportadora", equipo_id: 3, sector_id: 2, estado: "En Proceso", prioridad: "Alta", numero_cc: "710020", fecha_creacion: "2026-09-17" },
  { numero_ot: "OT10004", descripcion: "Mantenimiento preventivo programado", equipo_id: 4, sector_id: 2, estado: "Abierta", prioridad: "Media", numero_cc: null, fecha_creacion: "2026-09-18" },
  { numero_ot: "OT10005", descripcion: "Falla en quemador principal", equipo_id: 5, sector_id: 3, estado: "Abierta", prioridad: "Alta", numero_cc: "710030", fecha_creacion: "2026-09-18" },
  { numero_ot: "OT10006", descripcion: "Reparación de sello mecánico", equipo_id: 6, sector_id: 3, estado: "Abierta", prioridad: "Media", numero_cc: null, fecha_creacion: "2026-09-19" },
  { numero_ot: "OT10007", descripcion: "Ajuste de dosificado de tapas", equipo_id: 7, sector_id: 4, estado: "Abierta", prioridad: "Baja", numero_cc: "710040", fecha_creacion: "2026-09-19" },
  { numero_ot: "OT10008", descripcion: "Calibración de sensor de nivel", equipo_id: 9, sector_id: 5, estado: "Abierta", prioridad: "Alta", numero_cc: null, fecha_creacion: "2026-09-20" },
  { numero_ot: "OT10009", descripcion: "Mantenimiento correctivo compresor", equipo_id: 10, sector_id: 6, estado: "Finalizado", prioridad: "Media", numero_cc: "710050", fecha_creacion: "2026-09-10" },
  { numero_ot: "OT10010", descripcion: "Revisión de tablero eléctrico", equipo_id: 8, sector_id: 4, estado: "Abierta", prioridad: "Media", numero_cc: null, fecha_creacion: "2026-09-20" },
];

/** Pedidos de Trabajo "importados desde JD Edwards". */
export const pedidosDeTrabajoJDE = [
  { numero_pedido: "PED20001", solicitante: "Producción - Extracción", area: "Producción", equipo_id: 1, descripcion: "Ruido extraño al arrancar la prensa", prioridad: "Alta", estado: "Pendiente", fecha: "2026-09-19" },
  { numero_pedido: "PED20002", solicitante: "Calidad", area: "Calidad", equipo_id: 7, descripcion: "Llenadora no respeta el peso objetivo", prioridad: "Media", estado: "Pendiente", fecha: "2026-09-19" },
  { numero_pedido: "PED20003", solicitante: "Producción - Molienda", area: "Producción", equipo_id: 4, descripcion: "Sobrecalentamiento del motor del descascarador", prioridad: "Alta", estado: "Pendiente", fecha: "2026-09-20" },
  { numero_pedido: "PED20004", solicitante: "Logística", area: "Logística", equipo_id: 9, descripcion: "Válvula de tanque pierde por sello", prioridad: "Media", estado: "Pendiente", fecha: "2026-09-20" },
  { numero_pedido: "PED20005", solicitante: "Jefatura de Planta", area: "Jefatura de Planta", equipo_id: 10, descripcion: "Ruido inusual en compresor de aire", prioridad: "Baja", estado: "Pendiente", fecha: "2026-09-21" },
];

/** Tabla maestra OT Bolsa (RF-30, RF-31). */
export const otBolsa = [
  { id: 1, sector_id: 1, especialidad_id: 1, tipo_mantenimiento: "Correctivo", numero_ot: "OT00BLS1", numero_cc: "700001" },
  { id: 2, sector_id: 2, especialidad_id: 2, tipo_mantenimiento: "Correctivo", numero_ot: "OT00BLS2", numero_cc: "700002" },
  { id: 3, sector_id: 3, especialidad_id: 3, tipo_mantenimiento: "Preventivo", numero_ot: "OT00BLS3", numero_cc: "700003" },
  { id: 4, sector_id: 6, especialidad_id: 1, tipo_mantenimiento: "Correctivo", numero_ot: "OT00BLS4", numero_cc: "700004" },
];

export const otBloqueadas = [
  { numero_ot: "OT99001", motivo: "Pendiente de aprobación presupuestaria", fecha_bloqueo: "2026-09-01" },
];

export const ccBloqueadas = [
  { numero_cc: "999999", motivo: "Cuenta corta cerrada por Contaduría", fecha_bloqueo: "2026-09-01" },
];

export const tiposMantenimiento = ["Correctivo", "Preventivo", "Predictivo"];
export const criticidades = ["Alta", "Media", "Baja"];
export const estadosTrabajo = ["Pendiente", "Finalizado"];

/** Usuarios de demostración, uno por rol (ver DRF sección 9). */
export const usuariosDemo = [
  { id: 1, nombre: "Juan Cruz Sánchez", usuario: "jsanchez", rol: "Administrador" },
  { id: 2, nombre: "Mariana Ibarra", usuario: "mibarra", rol: "Supervisor" },
  { id: 3, nombre: "Carlos Ramírez", usuario: "cramirez", rol: "Técnico" },
  { id: 4, nombre: "Producción (solo consulta)", usuario: "consulta.produccion", rol: "Consulta" },
];

/**
 * Historial inicial de demostración: algunas intervenciones ya cargadas,
 * para que el Dashboard, el Historial y Pase de Turno no arranquen vacíos.
 * Los campos siguen exactamente la forma que produce `logic/historial.js`.
 */
export function historialSemilla() {
  const base = (over) => ({
    usuario_carga: "cramirez",
    adjuntos: [],
    operarios: [1, 2],
    tipo_mantenimiento: "Correctivo",
    turno_id: 1,
    es_ot_bolsa: false,
    numero_pedido: null,
    ot_numero_ref: null,
    ...over,
  });

  return [
    base({
      id: "H-1",
      id_original: "H-1",
      origen: "Formulario de Carga",
      fecha_inicio: "2026-09-18",
      hora_inicio: "08:00",
      fecha_fin: "2026-09-18",
      hora_fin: "11:00",
      equipo_id: 5,
      sector_id: 3,
      descripcion: "Reemplazo de válvula de purga en caldera N°2.",
      estado: "Finalizado",
      numero_ot: "OT10005",
      numero_cc: "710030",
      criticidad: "Alta",
      cantidadOperarios: 2,
      totalHorasHombre: 6,
      horasHombreAGD: 6,
      horasHombreTerceros: 0,
      fecha_creacion: "2026-09-18T11:05:00.000Z",
    }),
    base({
      id: "H-2",
      id_original: "H-2",
      origen: "Formulario de Carga",
      fecha_inicio: "2026-09-19",
      hora_inicio: "14:00",
      fecha_fin: "2026-09-19",
      hora_fin: "22:00",
      equipo_id: 9,
      sector_id: 5,
      descripcion: "Inspección preventiva anual del tanque 12.",
      estado: "Finalizado",
      numero_ot: "OT10008",
      numero_cc: "710060",
      criticidad: "Media",
      tipo_mantenimiento: "Preventivo",
      operarios: [3],
      turno_id: 2,
      cantidadOperarios: 1,
      totalHorasHombre: 8,
      horasHombreAGD: 8,
      horasHombreTerceros: 0,
      fecha_creacion: "2026-09-19T22:10:00.000Z",
    }),
    base({
      id: "H-3",
      id_original: "H-3",
      origen: "Registro Rápido - OT",
      fecha_inicio: "2026-09-20",
      hora_inicio: "22:00",
      fecha_fin: "2026-09-21",
      hora_fin: "02:00",
      equipo_id: 6,
      sector_id: 3,
      descripcion: "Se retira sello mecánico da\u00f1ado; falta repuesto en stock.",
      estado: "Pendiente",
      numero_ot: "OT10006",
      numero_cc: null,
      criticidad: "Media",
      operarios: [5, 9],
      turno_id: 3,
      ot_numero_ref: "OT10006",
      cantidadOperarios: 2,
      totalHorasHombre: 8,
      horasHombreAGD: 4,
      horasHombreTerceros: 4,
      fecha_creacion: "2026-09-21T02:05:00.000Z",
    }),
  ];
}

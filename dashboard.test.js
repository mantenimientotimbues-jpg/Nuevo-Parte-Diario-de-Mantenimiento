import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularIndicadoresDashboard } from "../dashboard.js";
import { crearRegistroInicial } from "../historial.js";

test("calcula correctamente los indicadores principales del Dashboard", () => {
  const historial = [
    crearRegistroInicial({
      estado: "Finalizado",
      tipo_mantenimiento: "Correctivo",
      criticidad: "Alta",
      sector_id: 1,
      totalHorasHombre: 8,
      horasHombreAGD: 8,
      horasHombreTerceros: 0,
      cantidadOperarios: 2,
      numero_ot: "OT10001",
      numero_cc: "700100",
    }),
    crearRegistroInicial({
      estado: "Finalizado",
      tipo_mantenimiento: "Preventivo",
      criticidad: "Media",
      sector_id: 2,
      totalHorasHombre: 4,
      horasHombreAGD: 0,
      horasHombreTerceros: 4,
      cantidadOperarios: 1,
      numero_ot: "OT10002",
      numero_cc: "700200",
    }),
    crearRegistroInicial({
      estado: "Pendiente",
      tipo_mantenimiento: "Correctivo",
      criticidad: "Alta",
      sector_id: 1,
      totalHorasHombre: 2,
      horasHombreAGD: 2,
      horasHombreTerceros: 0,
      cantidadOperarios: 1,
      numero_ot: null,
      numero_cc: null,
      numero_pedido: "PED001",
    }),
  ];

  const ordenesDeTrabajo = [
    { numero_ot: "OT10001", estado: "Finalizado", prioridad: "Alta" },
    { numero_ot: "OT10003", estado: "Abierta", prioridad: "Alta" },
    { numero_ot: "OT10004", estado: "En Proceso", prioridad: "Media" },
  ];

  const resultado = calcularIndicadoresDashboard({
    historial,
    ordenesDeTrabajo,
    sectoresPorId: { 1: "Extracción", 2: "Molienda" },
  });

  assert.equal(resultado.otAbiertas, 2); // OT10003 + OT10004
  assert.equal(resultado.otFinalizadas, 1); // OT10001
  assert.equal(resultado.horasAcumuladas, 14); // 8 + 4 + 2
  assert.equal(resultado.horasAGD, 10); // 8 + 0 + 2
  assert.equal(resultado.horasTerceros, 4);
  assert.equal(resultado.preventivosRegistrados, 1);
  assert.equal(resultado.sinOTCC, 1); // el registro originado en Pedido, sin OT/CC

  // MTTR: solo el primer registro (Correctivo + Finalizado) cuenta -> 8h / 2 operarios = 4
  assert.equal(resultado.mttr, 4);
});

test("con historial vacío no rompe y devuelve ceros", () => {
  const resultado = calcularIndicadoresDashboard({
    historial: [],
    ordenesDeTrabajo: [],
    sectoresPorId: {},
  });
  assert.equal(resultado.otAbiertas, 0);
  assert.equal(resultado.horasAcumuladas, 0);
  assert.equal(resultado.mttr, 0);
  assert.deepEqual(resultado.trabajosPorCriticidad, []);
});

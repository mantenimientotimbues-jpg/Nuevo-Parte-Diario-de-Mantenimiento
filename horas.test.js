import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularHoras } from "../horas.js";

test("calcula correctamente horas hombre con operarios propios y de terceros", () => {
  const resultado = calcularHoras({
    fechaInicio: "2026-09-21",
    horaInicio: "08:00",
    fechaFin: "2026-09-21",
    horaFin: "12:00", // 4 horas de duración
    operarios: [
      { id: 1, empresaTipo: "propia" },
      { id: 2, empresaTipo: "propia" },
      { id: 3, empresaTipo: "tercero" },
    ],
  });

  assert.equal(resultado.error, null);
  assert.equal(resultado.duracionHoras, 4);
  assert.equal(resultado.cantidadOperarios, 3);
  assert.equal(resultado.totalHorasHombre, 12); // 4h * 3 operarios
  assert.equal(resultado.horasHombreAGD, 8); // 4h * 2 propios
  assert.equal(resultado.horasHombreTerceros, 4); // 4h * 1 tercero
});

test("calcula horas correctamente cuando el tramo cruza la medianoche", () => {
  const resultado = calcularHoras({
    fechaInicio: "2026-09-21",
    horaInicio: "22:00",
    fechaFin: "2026-09-22",
    horaFin: "02:00", // 4 horas, cruzando el día
    operarios: [{ id: 1, empresaTipo: "propia" }],
  });

  assert.equal(resultado.error, null);
  assert.equal(resultado.duracionHoras, 4);
  assert.equal(resultado.totalHorasHombre, 4);
});

test("devuelve error si la fecha/hora de fin es anterior al inicio", () => {
  const resultado = calcularHoras({
    fechaInicio: "2026-09-21",
    horaInicio: "12:00",
    fechaFin: "2026-09-21",
    horaFin: "08:00",
    operarios: [{ id: 1, empresaTipo: "propia" }],
  });

  assert.notEqual(resultado.error, null);
  assert.equal(resultado.totalHorasHombre, 0);
});

test("devuelve error si faltan fechas/horas", () => {
  const resultado = calcularHoras({
    fechaInicio: "2026-09-21",
    horaInicio: "",
    fechaFin: "2026-09-21",
    horaFin: "10:00",
    operarios: [],
  });

  assert.notEqual(resultado.error, null);
});

test("sin operarios seleccionados, el total de horas hombre es 0", () => {
  const resultado = calcularHoras({
    fechaInicio: "2026-09-21",
    horaInicio: "08:00",
    fechaFin: "2026-09-21",
    horaFin: "10:00",
    operarios: [],
  });

  assert.equal(resultado.error, null);
  assert.equal(resultado.cantidadOperarios, 0);
  assert.equal(resultado.totalHorasHombre, 0);
});

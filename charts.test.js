import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularSegmentosDona } from "../charts.js";

test("calcula porcentajes y offsets acumulados correctamente", () => {
  const segmentos = calcularSegmentosDona([
    { label: "Correctivo", value: 3, color: "#A61C1C" },
    { label: "Preventivo", value: 1, color: "#2E7D32" },
  ]);

  assert.equal(segmentos.length, 2);
  assert.equal(segmentos[0].porcentaje, 75);
  assert.equal(segmentos[0].offset, 0);
  assert.equal(segmentos[1].porcentaje, 25);
  assert.equal(segmentos[1].offset, 75);
});

test("ignora categorías en cero y no rompe con total 0", () => {
  const segmentos = calcularSegmentosDona([
    { label: "A", value: 0 },
    { label: "B", value: 0 },
  ]);
  assert.deepEqual(segmentos, []);
});

test("con una sola categoría, ocupa el 100%", () => {
  const segmentos = calcularSegmentosDona([{ label: "Único", value: 5 }]);
  assert.equal(segmentos[0].porcentaje, 100);
  assert.equal(segmentos[0].offset, 0);
});

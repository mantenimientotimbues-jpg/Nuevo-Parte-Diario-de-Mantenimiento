import { test } from "node:test";
import assert from "node:assert/strict";
import { resolverOTBolsa } from "../otBolsa.js";

const otBolsa = [
  {
    sector_id: 1,
    especialidad_id: 2,
    tipo_mantenimiento: "Correctivo",
    numero_ot: "OT00777",
    numero_cc: "700100",
  },
];

test("resuelve OT Bolsa cuando existe la combinación sector/especialidad/tipo", () => {
  const r = resolverOTBolsa({
    sectorId: 1,
    especialidadId: 2,
    tipoMantenimiento: "Correctivo",
    otBolsa,
  });
  assert.equal(r.encontrado, true);
  assert.equal(r.numero_ot, "OT00777");
  assert.equal(r.numero_cc, "700100");
});

test("no resuelve OT Bolsa si no existe la combinación", () => {
  const r = resolverOTBolsa({
    sectorId: 1,
    especialidadId: 2,
    tipoMantenimiento: "Preventivo", // no configurado para ese sector/especialidad
    otBolsa,
  });
  assert.equal(r.encontrado, false);
  assert.equal(r.numero_ot, null);
  assert.notEqual(r.motivo, null);
});

test("compara sectorId/especialidadId sin importar si son string o number", () => {
  const r = resolverOTBolsa({
    sectorId: "1",
    especialidadId: "2",
    tipoMantenimiento: "Correctivo",
    otBolsa,
  });
  assert.equal(r.encontrado, true);
});

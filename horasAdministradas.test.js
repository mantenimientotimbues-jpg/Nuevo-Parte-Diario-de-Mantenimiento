import { test } from "node:test";
import assert from "node:assert/strict";
import { agregarHorasAdministradas } from "../horasAdministradas.js";
import { crearRegistroInicial } from "../historial.js";

test("agrupa correctamente por OT+CC y calcula el porcentaje sobre el total", () => {
  const historial = [
    crearRegistroInicial({ numero_ot: "OT1", numero_cc: "CC1", totalHorasHombre: 6, fecha_inicio: "2026-09-01" }),
    crearRegistroInicial({ numero_ot: "OT1", numero_cc: "CC1", totalHorasHombre: 4, fecha_inicio: "2026-09-02" }),
    crearRegistroInicial({ numero_ot: "OT2", numero_cc: "CC2", totalHorasHombre: 10, fecha_inicio: "2026-09-03" }),
    // sin OT/CC asignada: no debe entrar en la agregación
    crearRegistroInicial({ numero_ot: null, numero_cc: null, totalHorasHombre: 99, fecha_inicio: "2026-09-04" }),
  ];

  const resultado = agregarHorasAdministradas({ historial });

  assert.equal(resultado.length, 2);
  const ot1 = resultado.find((r) => r.numero_ot === "OT1");
  const ot2 = resultado.find((r) => r.numero_ot === "OT2");

  assert.equal(ot1.horas, 10); // 6 + 4
  assert.equal(ot2.horas, 10);
  assert.equal(ot1.porcentaje, 50);
  assert.equal(ot2.porcentaje, 50);
});

test("respeta el filtro de fecha desde/hasta", () => {
  const historial = [
    crearRegistroInicial({ numero_ot: "OT1", numero_cc: "CC1", totalHorasHombre: 6, fecha_inicio: "2026-09-01" }),
    crearRegistroInicial({ numero_ot: "OT2", numero_cc: "CC2", totalHorasHombre: 10, fecha_inicio: "2026-09-20" }),
  ];

  const resultado = agregarHorasAdministradas({ historial, fechaDesde: "2026-09-10" });
  assert.equal(resultado.length, 1);
  assert.equal(resultado[0].numero_ot, "OT2");
});

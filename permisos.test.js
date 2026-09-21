import { test } from "node:test";
import assert from "node:assert/strict";
import {
  puedeVer,
  puedeEscribir,
  puedeCompletarOTCC,
  puedeImportarJDE,
} from "../permisos.js";

test("Consulta puede ver el Dashboard pero no puede escribir", () => {
  assert.equal(puedeVer("dashboard", "Consulta"), true);
  assert.equal(puedeEscribir("dashboard", "Consulta"), false);
});

test("Consulta no tiene acceso al Formulario de Carga", () => {
  assert.equal(puedeVer("formularioCarga", "Consulta"), false);
});

test("Técnico puede registrar en Formulario de Carga y Pase de Turno", () => {
  assert.equal(puedeEscribir("formularioCarga", "Técnico"), true);
  assert.equal(puedeEscribir("paseDeTurno", "Técnico"), true);
});

test("Técnico NO puede completar OT/CC pendiente (solo Supervisor/Administrador)", () => {
  assert.equal(puedeCompletarOTCC("Técnico"), false);
  assert.equal(puedeCompletarOTCC("Supervisor"), true);
  assert.equal(puedeCompletarOTCC("Administrador"), true);
});

test("Solo Administrador puede importar datos de JD Edwards", () => {
  assert.equal(puedeImportarJDE("Administrador"), true);
  assert.equal(puedeImportarJDE("Supervisor"), false);
  assert.equal(puedeImportarJDE("Técnico"), false);
});

test("Técnico no tiene acceso a Configuración ni a Horas Administradas", () => {
  assert.equal(puedeVer("configuracion", "Técnico"), false);
  assert.equal(puedeVer("horasAdministradas", "Técnico"), false);
});

test("Supervisor puede escribir en Pedidos de Trabajo y Orden de Trabajo", () => {
  assert.equal(puedeEscribir("pedidosDeTrabajo", "Supervisor"), true);
  assert.equal(puedeEscribir("ordenDeTrabajo", "Supervisor"), true);
});

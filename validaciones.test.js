import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validarOT,
  validarCC,
  validarArchivoAdjunto,
  MAX_ADJUNTOS_POR_REGISTRO,
} from "../validaciones.js";

const ctxOT = {
  otsImportadas: [
    { numero_ot: "OT00123", equipo_id: 1 },
    { numero_ot: "OT00999", equipo_id: 2 },
  ],
  otBloqueadas: [{ numero_ot: "OT00999", motivo: "Pendiente de aprobación presupuestaria" }],
};

test("valida OT correcta (7 caracteres, existe, no bloqueada)", () => {
  const r = validarOT("OT00123", ctxOT);
  assert.equal(r.valido, true);
  assert.equal(r.ot.numero_ot, "OT00123");
});

test("rechaza OT con longitud incorrecta", () => {
  const r = validarOT("OT123", ctxOT);
  assert.equal(r.valido, false);
  assert.match(r.motivo, /7 caracteres/);
});

test("rechaza OT inexistente en el listado importado de JDE", () => {
  const r = validarOT("OT00111", ctxOT);
  assert.equal(r.valido, false);
  assert.match(r.motivo, /JD Edwards/);
});

test("rechaza OT bloqueada", () => {
  const r = validarOT("OT00999", ctxOT);
  assert.equal(r.valido, false);
  assert.match(r.motivo, /bloqueada/);
});

const ctxCC = {
  ccBloqueadas: [{ numero_cc: "999999", motivo: "Cuenta cerrada" }],
};

test("valida CC correcta (6 caracteres, no bloqueada)", () => {
  const r = validarCC("123456", ctxCC);
  assert.equal(r.valido, true);
});

test("rechaza CC con longitud incorrecta", () => {
  const r = validarCC("123", ctxCC);
  assert.equal(r.valido, false);
  assert.match(r.motivo, /6 caracteres/);
});

test("rechaza CC bloqueada", () => {
  const r = validarCC("999999", ctxCC);
  assert.equal(r.valido, false);
  assert.match(r.motivo, /bloqueada/);
});

test("valida un archivo adjunto correcto", () => {
  const r = validarArchivoAdjunto(
    { name: "foto.jpg", type: "image/jpeg", size: 1024 * 1024 },
    0
  );
  assert.equal(r.valido, true);
});

test("rechaza un archivo que supera el tamaño máximo (20 MB)", () => {
  const r = validarArchivoAdjunto(
    { name: "grande.pdf", type: "application/pdf", size: 21 * 1024 * 1024 },
    0
  );
  assert.equal(r.valido, false);
  assert.match(r.motivo, /20 MB/);
});

test("rechaza un tipo de archivo no admitido", () => {
  const r = validarArchivoAdjunto(
    { name: "video.mp4", type: "video/mp4", size: 1024 },
    0
  );
  assert.equal(r.valido, false);
  assert.match(r.motivo, /no admitido/);
});

test("rechaza adjuntar un sexto archivo cuando ya hay 5 (RNF-15)", () => {
  const r = validarArchivoAdjunto(
    { name: "foto6.jpg", type: "image/jpeg", size: 1024 },
    MAX_ADJUNTOS_POR_REGISTRO
  );
  assert.equal(r.valido, false);
  assert.match(r.motivo, /máximo/);
});

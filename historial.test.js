import { test } from "node:test";
import assert from "node:assert/strict";
import {
  crearRegistroInicial,
  continuarRegistro,
  obtenerUltimoPorCadena,
  filtrarPendientesPaseDeTurno,
  filtrarSinOTniCC,
  completarOTyCC,
  tieneRegistroAsociado,
} from "../historial.js";

function baseDatos(overrides = {}) {
  return {
    usuario_carga: "jsanchez",
    origen: "Formulario de Carga",
    equipo_id: 10,
    descripcion: "Cambio de rodamiento",
    estado: "Pendiente",
    numero_ot: "OT00123",
    numero_cc: "700100",
    sector_id: 1,
    criticidad: "Alta",
    operarios: [1, 2],
    ...overrides,
  };
}

test("crearRegistroInicial: id_original queda igual al id (raíz de la cadena)", () => {
  const r = crearRegistroInicial(baseDatos());
  assert.equal(r.id, r.id_original);
  assert.equal(r.adjuntos.length, 0);
});

test("continuarRegistro: genera un id nuevo pero preserva id_original de la cadena", () => {
  const inicial = crearRegistroInicial(baseDatos({ estado: "Pendiente" }));
  const continuado = continuarRegistro(inicial, { estado: "Finalizado" });

  assert.notEqual(continuado.id, inicial.id);
  assert.equal(continuado.id_original, inicial.id_original);
  assert.equal(continuado.estado, "Finalizado");
});

test("obtenerUltimoPorCadena: con 3 eslabones, devuelve solo el más reciente de cada cadena", () => {
  const h1 = crearRegistroInicial(baseDatos({ estado: "Pendiente" }));
  const h2 = continuarRegistro(h1, { estado: "Pendiente", descripcion: "Avance turno 2" });
  const h3 = continuarRegistro(h2, { estado: "Finalizado", descripcion: "Cierre turno 3" });

  // Otra cadena distinta, sin relación con la anterior
  const otra = crearRegistroInicial(baseDatos({ numero_ot: "OT00999", estado: "Finalizado" }));

  const historial = [h1, h2, h3, otra];
  const vigentes = obtenerUltimoPorCadena(historial);

  assert.equal(vigentes.length, 2); // una vigencia por cadena
  const vigenteCadena1 = vigentes.find((r) => r.id_original === h1.id_original);
  assert.equal(vigenteCadena1.id, h3.id); // el último eslabón
  assert.equal(vigenteCadena1.descripcion, "Cierre turno 3");
});

test("filtrarPendientesPaseDeTurno: solo muestra cadenas cuyo último estado es Pendiente", () => {
  const h1 = crearRegistroInicial(baseDatos({ estado: "Pendiente" }));
  const h2 = continuarRegistro(h1, { estado: "Finalizado" }); // esta cadena ya cerró

  const p1 = crearRegistroInicial(baseDatos({ numero_ot: "OT00999", estado: "Pendiente" }));
  // esta cadena sigue pendiente (sin continuación)

  const historial = [h1, h2, p1];
  const pendientes = filtrarPendientesPaseDeTurno(historial);

  assert.equal(pendientes.length, 1);
  assert.equal(pendientes[0].id, p1.id);
});

test("filtrarSinOTniCC: detecta registros originados en Pedido de Trabajo sin OT/CC asignada", () => {
  const registradoPorPedido = crearRegistroInicial(
    baseDatos({
      origen: "Registro Rápido - Pedido",
      numero_ot: null,
      numero_cc: null,
      numero_pedido: "PED00456",
    })
  );
  const conOTCompleta = crearRegistroInicial(baseDatos()); // ya tiene OT y CC completos

  const historial = [registradoPorPedido, conOTCompleta];
  const sinAsignar = filtrarSinOTniCC(historial);

  assert.equal(sinAsignar.length, 1);
  assert.equal(sinAsignar[0].id, registradoPorPedido.id);
});

test("completarOTyCC: completa correctamente cuando los valores son válidos", () => {
  const registro = crearRegistroInicial(
    baseDatos({
      origen: "Registro Rápido - Pedido",
      numero_ot: null,
      numero_cc: null,
    })
  );

  const ctx = {
    otsImportadas: [{ numero_ot: "OT00555" }],
    otBloqueadas: [],
    ccBloqueadas: [],
  };

  const resultado = completarOTyCC(registro, { numero_ot: "OT00555", numero_cc: "800200" }, ctx);

  assert.equal(resultado.ok, true);
  assert.equal(resultado.registro.numero_ot, "OT00555");
  assert.equal(resultado.registro.numero_cc, "800200");
  // el id y la cadena no deben cambiar: es una actualización, no un nuevo eslabón
  assert.equal(resultado.registro.id, registro.id);
  assert.equal(resultado.registro.id_original, registro.id_original);
});

test("completarOTyCC: rechaza si la OT no existe en el listado importado de JDE", () => {
  const registro = crearRegistroInicial(
    baseDatos({ origen: "Registro Rápido - Pedido", numero_ot: null, numero_cc: null })
  );

  const ctx = { otsImportadas: [], otBloqueadas: [], ccBloqueadas: [] };
  const resultado = completarOTyCC(registro, { numero_ot: "OT00555" }, ctx);

  assert.equal(resultado.ok, false);
  assert.equal(resultado.errores.length, 1);
});

test("tieneRegistroAsociado: detecta si un Pedido de Trabajo ya tiene trabajo registrado", () => {
  const registrado = crearRegistroInicial(
    baseDatos({ origen: "Registro Rápido - Pedido", numero_pedido: "PED00456" })
  );
  const historial = [registrado];

  const encontrado = tieneRegistroAsociado(historial, { numeroPedido: "PED00456" });
  const noEncontrado = tieneRegistroAsociado(historial, { numeroPedido: "PED00999" });

  assert.equal(encontrado.id, registrado.id);
  assert.equal(noEncontrado, null);
});

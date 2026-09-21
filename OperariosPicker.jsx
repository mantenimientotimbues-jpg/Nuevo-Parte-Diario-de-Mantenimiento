import React, { useState, useMemo } from "react";
import { useAppState } from "../state/AppContext.jsx";

/**
 * Selección múltiple de operarios (RF-24): al seleccionar cada operario,
 * el sistema completa automáticamente Empresa, Especialidad y Turno desde
 * la tabla maestra, sin permitir su edición manual.
 */
export default function OperariosPicker({ selectedIds = [], onChange, error }) {
  const { state } = useAppState();
  const [busqueda, setBusqueda] = useState("");

  const operariosConDatos = useMemo(
    () =>
      state.operarios.map((op) => ({
        ...op,
        empresa: state.empresas.find((e) => e.id === op.empresa_id),
        especialidad: state.especialidades.find((e) => e.id === op.especialidad_id),
        turno: state.turnos.find((t) => t.id === op.turno_id),
      })),
    [state.operarios, state.empresas, state.especialidades, state.turnos]
  );

  const filtrados = operariosConDatos.filter((op) =>
    op.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  function toggle(id) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Operarios <span className="text-agdRed">*</span>
      </label>
      <input
        type="text"
        placeholder="Buscar operario por nombre…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-agdBlue/30 focus:border-agdBlue"
      />
      <div
        className={`border rounded-lg divide-y max-h-48 overflow-y-auto ${
          error ? "border-agdRed" : "border-gray-300"
        }`}
      >
        {filtrados.length === 0 && (
          <p className="text-xs text-gray-400 italic px-3 py-2">Sin resultados.</p>
        )}
        {filtrados.map((op) => {
          const seleccionado = selectedIds.includes(op.id);
          return (
            <label
              key={op.id}
              className={`flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                seleccionado ? "bg-agdBlueLight/60" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={seleccionado}
                onChange={() => toggle(op.id)}
                className="w-4 h-4 rounded border-gray-300 text-agdBlue focus:ring-agdBlue/40"
              />
              <span className="font-medium text-gray-700 flex-1">{op.nombre}</span>
              <span className="text-xs text-gray-500">{op.especialidad?.nombre}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  op.empresa?.tipo === "propia"
                    ? "bg-agdBlueLight text-agdBlue"
                    : "bg-agdOrangeLight text-agdOrange"
                }`}
              >
                {op.empresa?.tipo === "propia" ? "AGD" : "Tercero"}
              </span>
              <span className="text-xs text-gray-400 hidden sm:inline">{op.turno?.nombre}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="text-xs text-agdRed mt-1 font-medium">{error}</p>}
      {selectedIds.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">{selectedIds.length} operario(s) seleccionado(s).</p>
      )}
    </div>
  );
}

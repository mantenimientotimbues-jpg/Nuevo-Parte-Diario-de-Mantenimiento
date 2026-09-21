import React, { useRef, useState } from "react";
import { validarArchivoAdjunto, MAX_ADJUNTOS_POR_REGISTRO } from "../logic/validaciones.js";

/**
 * Selector de archivos adjuntos del Formulario de Carga (RF-32, RF-33).
 * Nota: al no existir backend real en este prototipo, los archivos NO se
 * suben a ningún servidor; solo se conserva su nombre/tamaño/tipo en el
 * estado, exactamente como quedarían registrados en `Historial_Adjuntos`
 * (DRF sección 7) una vez implementado el almacenamiento real.
 */
export default function FileDropzone({ adjuntos = [], onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState(null);

  function agregarArchivos(fileList) {
    setError(null);
    const nuevos = [...adjuntos];
    for (const file of Array.from(fileList)) {
      const resultado = validarArchivoAdjunto(
        { name: file.name, type: file.type, size: file.size },
        nuevos.length
      );
      if (!resultado.valido) {
        setError(`"${file.name}": ${resultado.motivo}`);
        continue;
      }
      nuevos.push({ nombre: file.name, tamano: file.size, tipo: file.type });
    }
    onChange(nuevos);
  }

  function quitar(index) {
    onChange(adjuntos.filter((_, i) => i !== index));
  }

  function formatearTamano(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Archivos adjuntos (fotos / documentos) — opcional
      </label>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-4 text-center cursor-pointer hover:border-agdBlue hover:bg-agdBlueLight/30 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          agregarArchivos(e.dataTransfer.files);
        }}
      >
        <p className="text-sm text-gray-500">
          Hacé clic o arrastrá archivos aquí (JPG, PNG, PDF, DOCX, XLSX — máx. 20 MB, hasta{" "}
          {MAX_ADJUNTOS_POR_REGISTRO} archivos)
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            agregarArchivos(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="text-xs text-agdRed mt-1 font-medium">{error}</p>}

      {adjuntos.length > 0 && (
        <ul className="mt-2 space-y-1">
          {adjuntos.map((a, i) => (
            <li
              key={`${a.nombre}-${i}`}
              className="flex items-center justify-between text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1"
            >
              <span className="truncate text-gray-700">{a.nombre}</span>
              <span className="text-gray-400 ml-2 flex-shrink-0">{formatearTamano(a.tamano)}</span>
              <button
                type="button"
                onClick={() => quitar(i)}
                className="ml-2 text-agdRed hover:underline flex-shrink-0"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

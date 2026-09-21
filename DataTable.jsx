import React, { useMemo, useState } from "react";

/**
 * Grilla de datos reutilizable, inspirada en el módulo Historial del DRF
 * (RF-06 a RF-12): ordenamiento por columna, búsqueda libre, filtros por
 * columna (tipo "Excel" simplificado) y exportación a CSV.
 *
 * Simplificación respecto del DRF: se exporta a CSV (no a .xlsx real), ya
 * que generar un archivo Excel binario requeriría una librería externa
 * (por ejemplo, ExcelJS, mencionada en la sección 8 del DRF) que no forma
 * parte de este prototipo. Un archivo CSV se abre igualmente en Excel.
 *
 * @param {Object} props
 * @param {Array<{key:string, label:string, render?:Function, filtrable?:boolean}>} props.columns
 * @param {Array<Object>} props.rows
 * @param {string} props.exportFilename
 * @param {string} [props.emptyMessage]
 */
export default function DataTable({ columns, rows, exportFilename = "export", emptyMessage }) {
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState({ key: null, dir: "asc" });
  const [filtros, setFiltros] = useState({});

  const columnasFiltrables = columns.filter((c) => c.filtrable);

  const valoresPorColumna = useMemo(() => {
    const mapa = {};
    for (const col of columnasFiltrables) {
      const valores = new Set(rows.map((r) => String(col.render ? col.render(r) : r[col.key] ?? "")));
      mapa[col.key] = Array.from(valores).sort();
    }
    return mapa;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, columns]);

  const filasFiltradas = useMemo(() => {
    let out = rows;

    // Filtros por columna (activos)
    for (const [key, valor] of Object.entries(filtros)) {
      if (!valor) continue;
      const col = columns.find((c) => c.key === key);
      out = out.filter((r) => String(col.render ? col.render(r) : r[key] ?? "") === valor);
    }

    // Búsqueda libre sobre todas las columnas visibles
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      out = out.filter((r) =>
        columns.some((col) => {
          const val = col.render ? col.render(r) : r[col.key];
          return String(val ?? "").toLowerCase().includes(q);
        })
      );
    }

    // Ordenamiento
    if (orden.key) {
      const col = columns.find((c) => c.key === orden.key);
      out = [...out].sort((a, b) => {
        const va = col.render ? col.render(a) : a[orden.key];
        const vb = col.render ? col.render(b) : b[orden.key];
        if (va === vb) return 0;
        const cmp = va > vb ? 1 : -1;
        return orden.dir === "asc" ? cmp : -cmp;
      });
    }

    return out;
  }, [rows, columns, busqueda, filtros, orden]);

  function alternarOrden(key) {
    setOrden((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  }

  function exportarCSV() {
    const encabezados = columns.map((c) => c.label);
    const filas = filasFiltradas.map((r) =>
      columns.map((c) => {
        const val = c.render ? c.render(r) : r[c.key];
        const texto = String(val ?? "").replace(/"/g, '""');
        return `"${texto}"`;
      })
    );
    const contenido = [encabezados.join(","), ...filas.map((f) => f.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exportFilename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const filtrosActivos = Object.entries(filtros).filter(([, v]) => v);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          type="text"
          placeholder="Búsqueda libre…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 min-w-[180px] rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-agdBlue/30 focus:border-agdBlue"
        />
        {columnasFiltrables.map((col) => (
          <select
            key={col.key}
            value={filtros[col.key] || ""}
            onChange={(e) => setFiltros((f) => ({ ...f, [col.key]: e.target.value }))}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-agdBlue/30"
          >
            <option value="">{col.label}: todos</option>
            {(valoresPorColumna[col.key] || []).map((v) => (
              <option key={v} value={v}>
                {v || "(vacío)"}
              </option>
            ))}
          </select>
        ))}
        <button
          type="button"
          onClick={exportarCSV}
          className="ml-auto text-xs font-semibold bg-agdNavy text-white rounded-lg px-3 py-1.5 hover:bg-agdBlue transition-colors"
        >
          Exportar a Excel (CSV)
        </button>
      </div>

      {filtrosActivos.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {filtrosActivos.map(([key, val]) => {
            const col = columns.find((c) => c.key === key);
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 bg-agdBlueLight text-agdBlue text-xs rounded-full px-2 py-0.5"
              >
                {col?.label}: {val}
                <button
                  type="button"
                  onClick={() => setFiltros((f) => ({ ...f, [key]: "" }))}
                  className="font-bold hover:text-agdRed"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-agdNavy text-white">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => alternarOrden(col.key)}
                  className="px-3 py-2 text-left font-semibold cursor-pointer select-none whitespace-nowrap"
                >
                  {col.label}
                  {orden.key === col.key && <span className="ml-1">{orden.dir === "asc" ? "▲" : "▼"}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filasFiltradas.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center text-gray-400 italic py-6">
                  {emptyMessage || "Sin registros para mostrar."}
                </td>
              </tr>
            )}
            {filasFiltradas.map((row, i) => (
              <tr key={row.id ?? row.numero_ot ?? row.numero_pedido ?? i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-1">{filasFiltradas.length} registro(s).</p>
    </div>
  );
}

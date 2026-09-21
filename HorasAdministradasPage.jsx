import React, { useMemo, useState } from "react";
import { useAppState } from "../state/AppContext.jsx";
import { agregarHorasAdministradas } from "../logic/horasAdministradas.js";
import DataTable from "../components/DataTable.jsx";
import BarChartSVG from "../components/BarChartSVG.jsx";
import FormField from "../components/FormField.jsx";

export default function HorasAdministradasPage() {
  const { state } = useAppState();
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const filas = useMemo(
    () => agregarHorasAdministradas({ historial: state.historial, fechaDesde, fechaHasta }),
    [state.historial, fechaDesde, fechaHasta]
  );

  const columnas = [
    { key: "numero_ot", label: "N° OT" },
    { key: "numero_cc", label: "N° CC" },
    { key: "horas", label: "Horas imputadas" },
    { key: "porcentaje", label: "% sobre el total", render: (r) => `${r.porcentaje}%` },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-agdNavy">Horas Administradas</h1>
        <p className="text-sm text-gray-500">Control de horas imputadas por OT y Cuenta Corta (RF-55 a RF-57).</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
        <FormField label="Fecha desde" type="date" value={fechaDesde} onChange={setFechaDesde} />
        <FormField label="Fecha hasta" type="date" value={fechaHasta} onChange={setFechaHasta} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <BarChartSVG
          title="Horas imputadas por OT"
          data={filas.slice(0, 8).map((f) => ({ label: f.numero_ot, value: f.horas, color: "#2E74B5" }))}
        />
      </div>

      <DataTable columns={columnas} rows={filas} exportFilename="horas_administradas" />
    </div>
  );
}

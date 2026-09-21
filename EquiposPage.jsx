import React, { useMemo, useState } from "react";
import { useAppState } from "../state/AppContext.jsx";
import { puedeEscribir } from "../logic/permisos.js";
import DataTable from "../components/DataTable.jsx";
import Badge from "../components/Badge.jsx";
import FormField from "../components/FormField.jsx";

const FORM_INICIAL = { tag: "", descripcion: "", sector_id: "", tipo_equipo: "", ubicacion: "", criticidad: "", estado: "Operativo" };

export default function EquiposPage() {
  const { state, actions } = useAppState();
  const puedeAdministrar = puedeEscribir("equipos", state.rolActual);
  const [form, setForm] = useState(FORM_INICIAL);
  const [mostrarForm, setMostrarForm] = useState(false);

  const sectoresPorId = useMemo(() => Object.fromEntries(state.sectores.map((s) => [s.id, s.nombre])), [state.sectores]);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.tag || !form.descripcion || !form.sector_id || !form.criticidad) return;
    const nuevoId = Math.max(0, ...state.equipos.map((e) => e.id)) + 1;
    actions.agregarMaestro("equipos", { ...form, id: nuevoId, sector_id: Number(form.sector_id) });
    setForm(FORM_INICIAL);
    setMostrarForm(false);
  }

  const filas = state.equipos.map((e) => ({ ...e, sector_nombre: sectoresPorId[e.sector_id] }));

  const columnas = [
    { key: "tag", label: "Tag" },
    { key: "descripcion", label: "Descripción" },
    { key: "sector_nombre", label: "Sector", filtrable: true },
    { key: "tipo_equipo", label: "Tipo", filtrable: true },
    { key: "ubicacion", label: "Ubicación" },
    { key: "criticidad", label: "Criticidad", filtrable: true, render: (r) => <Badge tone={r.criticidad}>{r.criticidad}</Badge> },
    { key: "estado", label: "Estado", filtrable: true },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-agdNavy">Equipos / Activos</h1>
          <p className="text-sm text-gray-500">Inventario de equipos y activos críticos de la planta (RF-52 a RF-54).</p>
        </div>
        {puedeAdministrar && (
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="bg-agdNavy text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-agdBlue"
          >
            {mostrarForm ? "Cancelar" : "+ Nuevo equipo"}
          </button>
        )}
      </div>

      {mostrarForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Tag" required value={form.tag} onChange={(v) => set("tag", v)} />
          <FormField label="Descripción" required value={form.descripcion} onChange={(v) => set("descripcion", v)} />
          <FormField
            label="Sector"
            type="select"
            required
            value={form.sector_id}
            onChange={(v) => set("sector_id", v)}
            options={state.sectores.map((s) => ({ value: String(s.id), label: s.nombre }))}
          />
          <FormField label="Tipo de equipo" required value={form.tipo_equipo} onChange={(v) => set("tipo_equipo", v)} />
          <FormField label="Ubicación" value={form.ubicacion} onChange={(v) => set("ubicacion", v)} />
          <FormField
            label="Criticidad"
            type="select"
            required
            value={form.criticidad}
            onChange={(v) => set("criticidad", v)}
            options={["Alta", "Media", "Baja"].map((c) => ({ value: c, label: c }))}
          />
          <div className="sm:col-span-3">
            <button type="submit" className="bg-agdGreen text-white font-semibold rounded-lg px-5 py-2 hover:opacity-90">
              Guardar equipo
            </button>
          </div>
        </form>
      )}

      <DataTable columns={columnas} rows={filas} exportFilename="equipos" />
    </div>
  );
}

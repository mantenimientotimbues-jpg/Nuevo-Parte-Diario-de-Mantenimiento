import React, { useMemo, useState } from "react";
import { useAppState } from "../state/AppContext.jsx";
import { puedeEscribir } from "../logic/permisos.js";
import DataTable from "../components/DataTable.jsx";
import FormField from "../components/FormField.jsx";
import NoteBox from "../components/NoteBox.jsx";

const FORM_INICIAL = { empresa_id: "", ot_numero: "", equipo_id: "", trabajo_realizado: "", fecha: "", horas: "" };

export default function ProveedoresPage() {
  const { state, actions } = useAppState();
  const puedeCargar = puedeEscribir("proveedores", state.rolActual);
  const [form, setForm] = useState(FORM_INICIAL);
  const [error, setError] = useState(null);

  const empresasTerceras = state.empresas.filter((e) => e.tipo === "tercero");
  const empresasPorId = useMemo(() => Object.fromEntries(state.empresas.map((e) => [e.id, e])), [state.empresas]);
  const equiposPorId = useMemo(() => Object.fromEntries(state.equipos.map((e) => [e.id, e])), [state.equipos]);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.empresa_id || !form.ot_numero || !form.equipo_id || !form.trabajo_realizado || !form.fecha || !form.horas) {
      setError("Completá todos los campos obligatorios.");
      return;
    }
    actions.registrarProveedor({
      empresa_id: Number(form.empresa_id),
      ot_numero: form.ot_numero,
      equipo_id: Number(form.equipo_id),
      trabajo_realizado: form.trabajo_realizado,
      fecha: form.fecha,
      horas: Number(form.horas),
    });
    setForm(FORM_INICIAL);
    setError(null);
  }

  const filas = state.proveedoresRegistros.map((r) => ({
    ...r,
    empresa_nombre: empresasPorId[r.empresa_id]?.razon_social || "-",
    equipo_tag: equiposPorId[r.equipo_id]?.tag || "-",
  }));

  const columnas = [
    { key: "empresa_nombre", label: "Proveedor", filtrable: true },
    { key: "trabajo_realizado", label: "Trabajo realizado" },
    { key: "fecha", label: "Fecha" },
    { key: "horas", label: "Horas" },
    { key: "ot_numero", label: "OT asociada" },
    { key: "equipo_tag", label: "Equipo asociado" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-agdNavy">Proveedores</h1>
        <p className="text-sm text-gray-500">Actividades realizadas por empresas contratistas (RF-58, RF-59).</p>
      </div>

      {!puedeCargar ? (
        <NoteBox title="Acceso restringido">
          El rol <strong>{state.rolActual}</strong> no tiene permiso de escritura sobre este módulo.
        </NoteBox>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {error && <p className="sm:col-span-2 text-sm text-agdRed">{error}</p>}
          <FormField
            label="Proveedor"
            type="select"
            required
            value={form.empresa_id}
            onChange={(v) => set("empresa_id", v)}
            options={empresasTerceras.map((e) => ({ value: String(e.id), label: e.razon_social }))}
          />
          <FormField
            label="OT asociada"
            type="select"
            required
            value={form.ot_numero}
            onChange={(v) => set("ot_numero", v)}
            options={state.ordenesDeTrabajo.map((o) => ({ value: o.numero_ot, label: o.numero_ot }))}
          />
          <FormField
            label="Equipo asociado"
            type="select"
            required
            value={form.equipo_id}
            onChange={(v) => set("equipo_id", v)}
            options={state.equipos.map((e) => ({ value: String(e.id), label: `${e.tag} — ${e.descripcion}` }))}
          />
          <FormField label="Fecha" type="date" required value={form.fecha} onChange={(v) => set("fecha", v)} />
          <FormField label="Horas" type="number" required value={form.horas} onChange={(v) => set("horas", v)} />
          <FormField
            label="Trabajo realizado"
            type="textarea"
            required
            value={form.trabajo_realizado}
            onChange={(v) => set("trabajo_realizado", v)}
          />
          <div className="sm:col-span-2">
            <button type="submit" className="bg-agdNavy text-white font-semibold rounded-lg px-5 py-2.5 hover:bg-agdBlue transition-colors">
              Registrar actividad
            </button>
          </div>
        </form>
      )}

      <DataTable columns={columnas} rows={filas} exportFilename="proveedores" emptyMessage="Aún no hay actividades registradas." />
    </div>
  );
}

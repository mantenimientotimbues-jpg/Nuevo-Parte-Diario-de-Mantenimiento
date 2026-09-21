import React, { useState } from "react";
import { useAppState } from "../state/AppContext.jsx";
import { puedeImportarJDE, puedeAdministrarMaestros } from "../logic/permisos.js";
import FormField from "../components/FormField.jsx";
import NoteBox from "../components/NoteBox.jsx";
import DataTable from "../components/DataTable.jsx";
import { formatDateTime } from "../logic/ids.js";

export default function ConfiguracionPage() {
  const { state, actions } = useAppState();

  const [otBloqueada, setOtBloqueada] = useState({ numero_ot: "", motivo: "" });
  const [ccBloqueada, setCcBloqueada] = useState({ numero_cc: "", motivo: "" });

  if (!puedeAdministrarMaestros(state.rolActual)) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-agdNavy mb-2">Configuración</h1>
        <NoteBox title="Acceso restringido">
          Este módulo es exclusivo del rol <strong>Administrador</strong> (DRF, sección 9.1). Cambiá el rol
          activo desde la barra lateral para acceder.
        </NoteBox>
      </div>
    );
  }

  function agregarOTBloqueada(e) {
    e.preventDefault();
    if (otBloqueada.numero_ot.length !== 7 || !otBloqueada.motivo) return;
    actions.agregarMaestro("otBloqueadas", { ...otBloqueada, fecha_bloqueo: new Date().toISOString().slice(0, 10) });
    setOtBloqueada({ numero_ot: "", motivo: "" });
  }

  function agregarCCBloqueada(e) {
    e.preventDefault();
    if (ccBloqueada.numero_cc.length !== 6 || !ccBloqueada.motivo) return;
    actions.agregarMaestro("ccBloqueadas", { ...ccBloqueada, fecha_bloqueo: new Date().toISOString().slice(0, 10) });
    setCcBloqueada({ numero_cc: "", motivo: "" });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-agdNavy">Configuración</h1>
        <p className="text-sm text-gray-500">
          Administración de tablas maestras e importación de datos desde JD Edwards (RF-60 a RF-64).
        </p>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="font-semibold text-agdNavy">Importación de datos JD Edwards</h2>
        <NoteBox>
          en esta demo los datos de OT y Pedidos de Trabajo ya están precargados. Este botón simula el proceso
          de importación y registra la operación en el log de auditoría (RF-63, RF-64), tal como lo haría el
          backend real al procesar un archivo Excel/CSV exportado desde JD Edwards.
        </NoteBox>
        <div className="flex gap-2">
          <button
            disabled={!puedeImportarJDE(state.rolActual)}
            onClick={() => actions.simularImportacionJDE("OT")}
            className="bg-agdPurple text-white text-sm font-semibold rounded-lg px-4 py-2 hover:opacity-90 disabled:opacity-40"
          >
            Simular importación de OT
          </button>
          <button
            disabled={!puedeImportarJDE(state.rolActual)}
            onClick={() => actions.simularImportacionJDE("Pedido")}
            className="bg-agdPurple text-white text-sm font-semibold rounded-lg px-4 py-2 hover:opacity-90 disabled:opacity-40"
          >
            Simular importación de Pedidos
          </button>
        </div>
        {state.importLog.length > 0 && (
          <ul className="text-xs text-gray-500 space-y-1 mt-2">
            {state.importLog.slice(0, 5).map((log) => (
              <li key={log.id}>
                {formatDateTime(log.fecha_hora)} — {log.tipo}: {log.cantidad_registros} registro(s) — {log.resultado}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="font-semibold text-agdNavy">Tabla maestra: OT Bloqueadas</h2>
        <form onSubmit={agregarOTBloqueada} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <FormField label="N° de OT (7 car.)" value={otBloqueada.numero_ot} onChange={(v) => setOtBloqueada((s) => ({ ...s, numero_ot: v }))} />
          <FormField label="Motivo del bloqueo" value={otBloqueada.motivo} onChange={(v) => setOtBloqueada((s) => ({ ...s, motivo: v }))} />
          <button type="submit" className="bg-agdNavy text-white text-sm font-semibold rounded-lg px-4 py-2 h-fit hover:bg-agdBlue">
            Agregar
          </button>
        </form>
        <DataTable
          columns={[
            { key: "numero_ot", label: "N° OT" },
            { key: "motivo", label: "Motivo" },
            { key: "fecha_bloqueo", label: "Fecha de bloqueo" },
          ]}
          rows={state.otBloqueadas}
          exportFilename="ot_bloqueadas"
        />
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="font-semibold text-agdNavy">Tabla maestra: CC Bloqueadas</h2>
        <form onSubmit={agregarCCBloqueada} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <FormField label="N° de CC (6 car.)" value={ccBloqueada.numero_cc} onChange={(v) => setCcBloqueada((s) => ({ ...s, numero_cc: v }))} />
          <FormField label="Motivo del bloqueo" value={ccBloqueada.motivo} onChange={(v) => setCcBloqueada((s) => ({ ...s, motivo: v }))} />
          <button type="submit" className="bg-agdNavy text-white text-sm font-semibold rounded-lg px-4 py-2 h-fit hover:bg-agdBlue">
            Agregar
          </button>
        </form>
        <DataTable
          columns={[
            { key: "numero_cc", label: "N° CC" },
            { key: "motivo", label: "Motivo" },
            { key: "fecha_bloqueo", label: "Fecha de bloqueo" },
          ]}
          rows={state.ccBloqueadas}
          exportFilename="cc_bloqueadas"
        />
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="font-semibold text-agdNavy">Log de Auditoría</h2>
        <DataTable
          columns={[
            { key: "fecha_hora", label: "Fecha/Hora", render: (r) => formatDateTime(r.fecha_hora) },
            { key: "usuario", label: "Usuario", filtrable: true },
            { key: "accion", label: "Acción", filtrable: true },
            { key: "detalle", label: "Detalle" },
          ]}
          rows={state.auditLog}
          exportFilename="log_auditoria"
          emptyMessage="Todavía no se registraron acciones auditables en esta sesión."
        />
      </section>

      <section className="bg-white rounded-xl border border-agdRed/30 p-4">
        <h2 className="font-semibold text-agdRed mb-2">Zona de demostración</h2>
        <p className="text-sm text-gray-500 mb-3">
          Reinicia todos los datos (Historial, auditoría, importaciones) a los valores semilla iniciales.
          Útil para repetir una demo desde cero.
        </p>
        <button
          onClick={() => {
            if (confirm("¿Reiniciar todos los datos de la demo? Esta acción no se puede deshacer.")) {
              actions.reiniciarDemo();
            }
          }}
          className="bg-agdRed text-white text-sm font-semibold rounded-lg px-4 py-2 hover:opacity-90"
        >
          Reiniciar datos de demostración
        </button>
      </section>
    </div>
  );
}

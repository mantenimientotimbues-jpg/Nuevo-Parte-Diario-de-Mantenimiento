import React from "react";
import { useAppState } from "../state/AppContext.jsx";
import { ROLES, puedeVer } from "../logic/permisos.js";

export const MODULOS = [
  { key: "dashboard", label: "Inicio", icon: "🏠" },
  { key: "historial", label: "Historial", icon: "📋" },
  { key: "paseDeTurno", label: "Pase de Turno", icon: "🔄" },
  { key: "formularioCarga", label: "Formulario de Carga", icon: "📝" },
  { key: "pedidosDeTrabajo", label: "Pedidos de Trabajo", icon: "📥" },
  { key: "ordenDeTrabajo", label: "Orden de Trabajo", icon: "🔧" },
  { key: "equipos", label: "Equipos / Activos", icon: "⚙️" },
  { key: "horasAdministradas", label: "Horas Administradas", icon: "⏱️" },
  { key: "proveedores", label: "Proveedores", icon: "🚚" },
  { key: "configuracion", label: "Configuración", icon: "🛠️" },
];

export default function Sidebar({ paginaActual, onNavigate }) {
  const { state, actions } = useAppState();

  return (
    <aside className="w-64 flex-shrink-0 bg-agdNavy text-white flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/10">
        <p className="text-lg font-bold leading-tight">SGM</p>
        <p className="text-xs text-white/60 leading-tight">AGD · Planta Timbúes</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {MODULOS.map((m) => {
          const habilitado = puedeVer(m.key, state.rolActual);
          const activo = paginaActual === m.key;
          return (
            <button
              key={m.key}
              type="button"
              disabled={!habilitado}
              onClick={() => onNavigate(m.key)}
              title={!habilitado ? `Sin acceso para el rol ${state.rolActual}` : ""}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm text-left transition-colors ${
                activo ? "bg-white/10 border-l-4 border-agdGold font-semibold" : "border-l-4 border-transparent"
              } ${
                habilitado
                  ? "hover:bg-white/10 text-white/90 cursor-pointer"
                  : "text-white/30 cursor-not-allowed"
              }`}
            >
              <span className="text-base">{m.icon}</span>
              <span className="flex-1">{m.label}</span>
              {!habilitado && <span className="text-[10px]">🔒</span>}
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 text-xs">
        <label className="block text-white/50 mb-1">Rol activo (simulado)</label>
        <select
          value={state.rolActual}
          onChange={(e) => actions.cambiarRol(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-agdGold/50"
        >
          {ROLES.map((r) => (
            <option key={r} value={r} className="text-gray-800">
              {r}
            </option>
          ))}
        </select>
        <p className="mt-2 text-white/40">{state.usuarioActual.nombre}</p>
        <p className="mt-3 text-white/30 leading-snug">
          DRF v1.4 — Prototipo funcional Fase 1. Sin backend ni autenticación real.
        </p>
      </div>
    </aside>
  );
}

import React from "react";

/**
 * Campo de formulario reutilizable (texto, fecha, hora, select, textarea,
 * checkbox), con etiqueta, marca de obligatoriedad y mensaje de error
 * homogéneos en todos los módulos de carga del SGM.
 */
export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  options,
  required,
  error,
  placeholder,
  disabled,
  help,
  rows = 3,
}) {
  const baseInputClass =
    "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors " +
    (error
      ? "border-agdRed focus:ring-agdRed/30"
      : "border-gray-300 focus:ring-agdBlue/30 focus:border-agdBlue") +
    (disabled ? " bg-gray-100 text-gray-400 cursor-not-allowed" : " bg-white");

  if (type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm text-gray-700 select-none">
        <input
          type="checkbox"
          checked={!!value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-agdBlue focus:ring-agdBlue/40"
        />
        <span>
          {label} {required && <span className="text-agdRed">*</span>}
        </span>
      </label>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-agdRed">*</span>}
      </label>

      {type === "select" && (
        <select
          className={baseInputClass}
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            Seleccionar…
          </option>
          {(options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {type === "textarea" && (
        <textarea
          className={baseInputClass}
          value={value ?? ""}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {["text", "date", "time", "number"].includes(type) && (
        <input
          type={type}
          className={baseInputClass}
          value={value ?? ""}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {help && !error && <p className="text-xs text-gray-400 mt-1">{help}</p>}
      {error && <p className="text-xs text-agdRed mt-1 font-medium">{error}</p>}
    </div>
  );
}

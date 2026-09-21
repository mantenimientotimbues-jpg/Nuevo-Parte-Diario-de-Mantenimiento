import React from "react";

/**
 * Recuadro de aclaración, con el mismo estilo visual usado en el DRF
 * ("Aclaración importante"), para mantener coherencia entre el documento
 * de requerimientos y el prototipo.
 */
export default function NoteBox({ children, title = "Aclaración importante" }) {
  return (
    <div className="bg-agdGoldLight border border-agdGold/40 text-agdGold rounded-lg px-4 py-3 text-sm leading-relaxed">
      <span className="font-bold">{title}: </span>
      <span className="text-[#5C4A00]">{children}</span>
    </div>
  );
}

"use client";

import { useState } from "react";

export function ContactReveal({ phone }: { phone: string | null }) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return (
      <p className="mt-2 rounded-[2px] bg-ink/4 px-3 py-1.5 text-center font-mono text-[11.5px] text-ink">
        {phone ? phone : "Pas de numéro renseigné"}
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className="mt-2 w-full rounded-[2px] border border-card-border px-3 py-1.5 font-mono text-[10.5px] uppercase text-ink-dim hover:border-orange hover:text-orange"
    >
      Contacter
    </button>
  );
}

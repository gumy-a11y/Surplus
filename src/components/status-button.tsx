"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/toast";
import type { ProductStatus, ProductType } from "@/types/database";

export function StatusButton({
  productId,
  type,
  status,
}: {
  productId: string;
  type: ProductType;
  status: ProductStatus;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [pending, setPending] = useState(false);

  async function updateStatus(next: ProductStatus, message: string) {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({ status: next })
      .eq("id", productId);
    setPending(false);
    if (error) {
      showToast("Erreur : " + error.message);
      return;
    }
    showToast(message);
    router.refresh();
  }

  if (type === "pret") {
    const next = status === "disponible" ? "emprunte" : "disponible";
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          updateStatus(
            next,
            next === "emprunte" ? "Marqué emprunté" : "Statut mis à jour"
          )
        }
        className="rounded-[2px] border border-card-border px-2 py-1 font-mono text-[10px] text-ink-dim uppercase hover:border-orange hover:text-orange disabled:opacity-40"
      >
        Marquer {next === "emprunte" ? "emprunté" : "disponible"}
      </button>
    );
  }

  if (type === "don" && status !== "donne") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => updateStatus("donne", "Marqué comme donné")}
        className="rounded-[2px] border border-card-border px-2 py-1 font-mono text-[10px] text-ink-dim uppercase hover:border-orange hover:text-orange disabled:opacity-40"
      >
        Marquer donné
      </button>
    );
  }

  return null;
}

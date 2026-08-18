"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/toast";
import { EmptyState } from "@/components/empty-state";

export interface Owner {
  id: string;
  pseudo: string;
  count: number;
  following: boolean;
}

export function FollowList({ owners }: { owners: Owner[] }) {
  const router = useRouter();
  const showToast = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = owners.filter((o) =>
    o.pseudo.toLowerCase().includes(search.trim().toLowerCase())
  );

  async function toggle(owner: Owner) {
    setPendingId(owner.id);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = owner.following
      ? await supabase
          .from("subscriptions")
          .delete()
          .eq("follower_id", user.id)
          .eq("followed_id", owner.id)
      : await supabase
          .from("subscriptions")
          .insert({ follower_id: user.id, followed_id: owner.id });

    setPendingId(null);
    if (error) {
      showToast("Erreur : " + error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="max-w-[480px]">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un pseudo…"
        className="mb-4 w-full rounded-full border border-card-border bg-ink/3 px-3.5 py-2 text-[13px] text-ink placeholder:text-concrete"
      />

      {filtered.length === 0 ? (
        <EmptyState title="Personne ne correspond">
          Aucun pseudo ne correspond à ta recherche.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((owner) => (
            <div
              key={owner.id}
              className="flex items-center justify-between rounded-[3px] border border-card-border bg-card-bg px-3.5 py-3"
            >
              <div>
                <div className="text-sm font-semibold">{owner.pseudo}</div>
                <div className="font-mono text-[11px] text-concrete">
                  {owner.count} objet{owner.count > 1 ? "s" : ""}
                </div>
              </div>
              <button
                type="button"
                disabled={pendingId === owner.id}
                onClick={() => toggle(owner)}
                className={`rounded-[2px] border px-3 py-1.5 font-mono text-[11px] uppercase disabled:opacity-40 ${
                  owner.following
                    ? "border-green bg-green font-bold text-blueprint-deep"
                    : "border-card-border bg-transparent text-ink-dim"
                }`}
              >
                {owner.following ? "Suivi ✓" : "Suivre"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

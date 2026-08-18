"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { StatusButton } from "@/components/status-button";
import { EmptyState } from "@/components/empty-state";
import type { ProductStatus, ProductType } from "@/types/database";

export interface CatalogueItem {
  id: string;
  title: string;
  description: string | null;
  type: ProductType;
  status: ProductStatus;
  photo_url: string | null;
  ownerLabel: string;
  isMine: boolean;
  categories: string[];
}

export function CatalogueView({ items }: { items: CatalogueItem[] }) {
  const [filterType, setFilterType] = useState<"tous" | ProductType>("tous");
  const [filterCat, setFilterCat] = useState("toutes");
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () => [...new Set(items.flatMap((p) => p.categories))].sort(),
    [items]
  );

  const filtered = items.filter((p) => {
    if (filterType !== "tous" && p.type !== filterType) return false;
    if (filterCat !== "toutes" && !p.categories.includes(filterCat))
      return false;
    if (search.trim() && !p.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div>
      <div className="mb-5.5 flex flex-wrap items-center gap-2">
        {(["tous", "don", "pret"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilterType(t)}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-[11.5px] tracking-wide uppercase whitespace-nowrap ${
              filterType === t
                ? "border-ink bg-ink text-blueprint-deep"
                : "border-card-border bg-ink/3 text-ink-dim"
            }`}
          >
            {t === "tous" ? "Tout" : t === "don" ? "Don" : "Prêt"}
          </button>
        ))}

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="rounded-full border border-card-border bg-ink/3 px-3.5 py-1.5 font-mono text-[11.5px] text-ink-dim uppercase"
        >
          <option value="toutes">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un objet…"
          className="min-w-[160px] flex-1 rounded-full border border-card-border bg-ink/3 px-3.5 py-2 text-[13px] text-ink placeholder:text-concrete"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Rien pour l'instant">
          Personne que tu suis n&apos;a d&apos;objet correspondant à ces
          filtres.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4.5">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              actions={
                p.isMine ? (
                  <StatusButton
                    productId={p.id}
                    type={p.type}
                    status={p.status}
                  />
                ) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

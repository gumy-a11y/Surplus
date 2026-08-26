"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/toast";
import { AddProductForm, type EditableProduct } from "@/components/add-product-form";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { StatusButton } from "@/components/status-button";
import { EmptyState } from "@/components/empty-state";

interface CategoryOption {
  id: number;
  name: string;
}

export function MesObjetsView({
  categories,
  userId,
  products,
}: {
  categories: CategoryOption[];
  userId: string;
  products: ProductCardData[];
}) {
  const router = useRouter();
  const showToast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EditableProduct | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function startCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function startEdit(p: ProductCardData) {
    setEditing({
      id: p.id,
      title: p.title,
      description: p.description,
      type: p.type,
      photo_url: p.photo_url,
      categories: p.categories,
    });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer définitivement cet objet ?")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      showToast("Erreur : " + error.message);
      return;
    }
    showToast("Objet supprimé");
    router.refresh();
  }

  return (
    <div>
      {formOpen ? (
        <AddProductForm
          key={editing?.id ?? "new"}
          categories={categories}
          userId={userId}
          editingProduct={editing}
          onCancel={closeForm}
          onSaved={closeForm}
        />
      ) : (
        <button
          type="button"
          onClick={startCreate}
          className="mb-6.5 rounded-[2px] bg-orange px-5 py-3 font-mono text-[12.5px] font-bold tracking-wide text-blueprint-deep uppercase"
        >
          Publier un nouvel objet
        </button>
      )}

      <p className="mb-3.5 font-mono text-[11px] tracking-[0.18em] text-orange uppercase">
        Mes objets ({products.length})
      </p>
      {products.length === 0 ? (
        <EmptyState title="Ton stock est vide">
          Clique sur « Publier un nouvel objet » pour ajouter le premier.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4.5">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              actions={
                <StatusButton productId={p.id} type={p.type} status={p.status} />
              }
              footer={
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="flex-1 rounded-[2px] border border-card-border px-2 py-1.5 font-mono text-[10px] uppercase text-ink-dim hover:border-orange hover:text-orange"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === p.id}
                    onClick={() => handleDelete(p.id)}
                    className="flex-1 rounded-[2px] border border-card-border px-2 py-1.5 font-mono text-[10px] uppercase text-ink-dim hover:border-orange hover:text-orange disabled:opacity-40"
                  >
                    Supprimer
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

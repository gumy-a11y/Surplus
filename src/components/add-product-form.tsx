"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/toast";
import { resizeImage } from "@/lib/resize-image";
import { CATEGORIES, type ProductType } from "@/types/database";

interface CategoryOption {
  id: number;
  name: string;
}

export function AddProductForm({
  categories,
  userId,
}: {
  categories: CategoryOption[];
  userId: string;
}) {
  const router = useRouter();
  const showToast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProductType>("don");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categoryOptions = categories.length
    ? categories.map((c) => c.name)
    : CATEGORIES;

  function toggleCategory(name: string) {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setType("don");
    setSelectedCategories([]);
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Donne un titre à ton objet");
      return;
    }
    if (selectedCategories.length === 0) {
      showToast("Choisis au moins une catégorie");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    let photoUrl: string | null = null;
    try {
      if (photoFile) {
        const blob = await resizeImage(photoFile);
        const path = `${userId}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("product-photos")
          .upload(path, blob, { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;
        photoUrl = supabase.storage.from("product-photos").getPublicUrl(path)
          .data.publicUrl;
      }

      const { data: product, error: insertError } = await supabase
        .from("products")
        .insert({
          owner_id: userId,
          title: title.trim(),
          description: description.trim() || null,
          type,
          status: "disponible",
          photo_url: photoUrl,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;

      const categoryIds = categories
        .filter((c) => selectedCategories.includes(c.name))
        .map((c) => c.id);

      if (categoryIds.length > 0) {
        const { error: linkError } = await supabase
          .from("product_categories")
          .insert(
            categoryIds.map((category_id) => ({
              product_id: product.id,
              category_id,
            }))
          );
        if (linkError) throw linkError;
      }

      showToast("Objet ajouté au catalogue");
      resetForm();
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      showToast("Erreur : " + message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6.5 max-w-[480px] rounded-[4px] border border-card-border bg-card-bg p-5.5"
    >
      <div className="mb-4">
        <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-concrete uppercase">
          Titre de l&apos;objet
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex : Reste de carrelage gris 60x60"
          className="w-full rounded-[2px] border border-card-border bg-ink/4 px-3 py-2.5 text-[13.5px] text-ink"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-concrete uppercase">
          Photo
        </label>
        <label className="relative block cursor-pointer overflow-hidden rounded-[2px] border border-dashed border-card-border p-3.5 text-center font-mono text-[11.5px] text-concrete">
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoPreview}
              alt=""
              className="mx-auto mt-2 max-h-[140px] max-w-full rounded-[2px]"
            />
          ) : (
            "Cliquer pour ajouter une photo"
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-concrete uppercase">
          Catégories (une ou plusieurs)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {categoryOptions.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCategory(c)}
              className={`rounded-full border px-3 py-1.5 font-mono text-[11.5px] tracking-wide uppercase ${
                selectedCategories.includes(c)
                  ? "border-orange bg-orange font-semibold text-blueprint-deep"
                  : "border-card-border bg-ink/3 text-ink-dim"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-concrete uppercase">
          Type
        </label>
        <div className="flex gap-2.5">
          <div
            onClick={() => setType("don")}
            className={`flex-1 cursor-pointer rounded-[2px] border p-2.5 text-center font-mono text-xs uppercase ${
              type === "don"
                ? "border-green bg-green/12 text-green"
                : "border-card-border text-ink-dim"
            }`}
          >
            Don
          </div>
          <div
            onClick={() => setType("pret")}
            className={`flex-1 cursor-pointer rounded-[2px] border p-2.5 text-center font-mono text-xs uppercase ${
              type === "pret"
                ? "border-orange bg-orange/12 text-orange"
                : "border-card-border text-ink-dim"
            }`}
          >
            Prêt
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-concrete uppercase">
          Description (optionnel)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="État, quantité, contraintes de retour…"
          className="min-h-[60px] w-full resize-y rounded-[2px] border border-card-border bg-ink/4 px-3 py-2.5 text-[13.5px] text-ink"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-[2px] bg-orange px-5 py-3 font-mono text-[12.5px] font-bold tracking-wide text-blueprint-deep uppercase disabled:opacity-40"
      >
        {submitting ? "Ajout en cours…" : "Ajouter au catalogue"}
      </button>
    </form>
  );
}

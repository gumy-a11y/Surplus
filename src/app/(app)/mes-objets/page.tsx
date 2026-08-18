import { createClient } from "@/lib/supabase/server";
import { AddProductForm } from "@/components/add-product-form";
import { ProductCard } from "@/components/product-card";
import { StatusButton } from "@/components/status-button";
import { EmptyState } from "@/components/empty-state";
import type { ProductStatus, ProductType } from "@/types/database";

interface ProductRow {
  id: string;
  title: string;
  description: string | null;
  type: ProductType;
  status: ProductStatus;
  photo_url: string | null;
  created_at: string;
  product_categories: { categories: { name: string } | null }[];
}

export default async function MesObjetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id, name").order("id"),
    supabase
      .from("products")
      .select(
        "id, title, description, type, status, photo_url, created_at, product_categories(categories(name))"
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .returns<ProductRow[]>(),
  ]);

  const mine = (products ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    type: p.type,
    status: p.status,
    photo_url: p.photo_url,
    categories: p.product_categories
      .map((pc) => pc.categories?.name)
      .filter((n): n is string => Boolean(n)),
  }));

  return (
    <div>
      <AddProductForm categories={categories ?? []} userId={user.id} />

      <p className="mb-3.5 font-mono text-[11px] tracking-[0.18em] text-orange uppercase">
        Mes objets ({mine.length})
      </p>
      {mine.length === 0 ? (
        <EmptyState title="Ton stock est vide">
          Ajoute ton premier objet avec le formulaire ci-dessus.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4.5">
          {mine.map((p) => (
            <ProductCard
              key={p.id}
              product={{ ...p, ownerLabel: "Vous" }}
              actions={
                <StatusButton
                  productId={p.id}
                  type={p.type}
                  status={p.status}
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

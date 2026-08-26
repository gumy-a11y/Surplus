import { createClient } from "@/lib/supabase/server";
import { MesObjetsView } from "@/components/mes-objets-view";
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
    ownerLabel: "Vous",
    categories: p.product_categories
      .map((pc) => pc.categories?.name)
      .filter((n): n is string => Boolean(n)),
  }));

  return (
    <MesObjetsView
      categories={categories ?? []}
      userId={user.id}
      products={mine}
    />
  );
}

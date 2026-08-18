import { createClient } from "@/lib/supabase/server";
import { CatalogueView } from "@/components/catalogue-view";
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
  owner_id: string;
  profiles: { pseudo: string } | null;
  product_categories: { categories: { name: string } | null }[];
}

export default async function CataloguePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("followed_id")
    .eq("follower_id", user.id);

  const followedIds = (subs ?? []).map((s) => s.followed_id);

  if (followedIds.length === 0) {
    return (
      <EmptyState title="Aucun abonnement">
        Va dans l&apos;onglet « Abonnements » pour t&apos;abonner à des
        proches et voir leurs objets ici.
      </EmptyState>
    );
  }

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, title, description, type, status, photo_url, created_at, owner_id, profiles(pseudo), product_categories(categories(name))"
    )
    .in("owner_id", followedIds)
    .order("created_at", { ascending: false })
    .returns<ProductRow[]>();

  const items = (products ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    type: p.type,
    status: p.status,
    photo_url: p.photo_url,
    ownerLabel: p.owner_id === user.id ? "Vous" : (p.profiles?.pseudo ?? "?"),
    isMine: p.owner_id === user.id,
    categories: p.product_categories
      .map((pc) => pc.categories?.name)
      .filter((n): n is string => Boolean(n)),
  }));

  return <CatalogueView items={items} />;
}

// Types calqués sur supabase/schema.sql

export type ProductType = "don" | "pret";
export type ProductStatus = "disponible" | "emprunte" | "donne";

export const CATEGORIES = [
  "Peinture & finition",
  "Visserie & fixation",
  "Bois & panneaux",
  "Menuiserie",
  "Électricité",
  "Plomberie",
  "Outillage électroportatif",
  "Outillage à main",
  "Carrelage & sol",
  "Isolation",
  "Matériau",
  "Jardin/Extérieur",
  "Autre",
] as const;

export const ARRONDISSEMENTS = Array.from({ length: 20 }, (_, i) => {
  const n = i + 1;
  return { value: String(n), label: n === 1 ? "1er" : `${n}e` };
});

export interface Profile {
  id: string;
  pseudo: string;
  avatar_url: string | null;
  location: string | null;
  arrondissement: string | null;
  phone: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  type: ProductType;
  status: ProductStatus;
  photo_url: string | null;
  loan_duration_days: number | null;
  created_at: string;
}

export interface Subscription {
  follower_id: string;
  followed_id: string;
  created_at: string;
}

// Vue applicative pratique : un produit avec son propriétaire et ses catégories résolues
export interface ProductWithRelations extends Product {
  owner: Pick<Profile, "id" | "pseudo">;
  categories: string[];
}

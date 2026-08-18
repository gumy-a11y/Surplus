-- ============================================================
-- SCHEMA : Plateforme de partage de matériaux/outils de chantier
-- À exécuter dans Supabase (SQL Editor) quand tu passes en vrai backend.
-- ============================================================

-- Extension nécessaire pour générer des identifiants uuid
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. PROFILS
-- Supabase gère déjà l'authentification (table auth.users).
-- On stocke ici les infos publiques (pseudo, avatar).
-- ------------------------------------------------------------
create table profiles (
  id          uuid references auth.users on delete cascade primary key,
  pseudo      text not null,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- ------------------------------------------------------------
-- 2. ABONNEMENTS
-- Qui suit qui. C'est ce qui détermine le catalogue vu par
-- chaque abonné (union des produits des gens qu'il suit).
-- ------------------------------------------------------------
create table subscriptions (
  follower_id  uuid references profiles(id) on delete cascade not null,
  followed_id  uuid references profiles(id) on delete cascade not null,
  created_at   timestamptz default now(),
  primary key (follower_id, followed_id),
  constraint no_self_follow check (follower_id <> followed_id)
);

-- ------------------------------------------------------------
-- 3. CATÉGORIES
-- Typologie de produits, utilisée pour les filtres.
-- ------------------------------------------------------------
create table categories (
  id    serial primary key,
  name  text unique not null
);

insert into categories (name) values
  ('Peinture & finition'),
  ('Visserie & fixation'),
  ('Bois & panneaux'),
  ('Menuiserie'),
  ('Électricité'),
  ('Plomberie'),
  ('Outillage électroportatif'),
  ('Outillage à main'),
  ('Carrelage & sol'),
  ('Isolation'),
  ('Matériau'),
  ('Jardin/Extérieur'),
  ('Autre');

-- ------------------------------------------------------------
-- 4. PRODUITS
-- Un produit = un item mis à disposition par un contributeur.
-- ------------------------------------------------------------
create table products (
  id                uuid default gen_random_uuid() primary key,
  owner_id          uuid references profiles(id) on delete cascade not null,
  title             text not null,
  description       text,
  type              text not null check (type in ('don', 'pret')),
  status            text not null default 'disponible'
                      check (status in ('disponible', 'emprunte', 'donne')),
  photo_url         text,
  loan_duration_days int,               -- optionnel, durée de prêt souhaitée
  created_at        timestamptz default now()
);

create index idx_products_owner on products(owner_id);
create index idx_products_status on products(status);

-- Un produit peut appartenir à plusieurs catégories (table de liaison)
create table product_categories (
  product_id   uuid references products(id) on delete cascade not null,
  category_id  int references categories(id) on delete cascade not null,
  primary key (product_id, category_id)
);

create index idx_product_categories_product on product_categories(product_id);
create index idx_product_categories_category on product_categories(category_id);

-- ------------------------------------------------------------
-- 5. EMPRUNTS (historique / suivi)
-- Permet de savoir qui a quoi, et depuis quand.
-- ------------------------------------------------------------
create table loans (
  id            uuid default gen_random_uuid() primary key,
  product_id    uuid references products(id) on delete cascade not null,
  borrower_id   uuid references profiles(id) not null,
  borrowed_at   timestamptz default now(),
  due_at        timestamptz,
  returned_at   timestamptz
);

create index idx_loans_product on loans(product_id);
create index idx_loans_borrower on loans(borrower_id);

-- ============================================================
-- SÉCURITÉ : Row Level Security (RLS)
-- Indispensable dès que plusieurs personnes partagent la base.
-- ============================================================
alter table profiles          enable row level security;
alter table subscriptions     enable row level security;
alter table products          enable row level security;
alter table product_categories enable row level security;
alter table loans             enable row level security;

-- Tout le monde connecté peut voir tous les profils (pseudo, avatar)
create policy "profils visibles par tous les connectés"
  on profiles for select
  using (auth.role() = 'authenticated');

-- Chacun ne modifie que son propre profil
create policy "modifier son propre profil"
  on profiles for update
  using (auth.uid() = id);

-- Chacun gère ses propres abonnements
create policy "voir ses abonnements"
  on subscriptions for select
  using (auth.uid() = follower_id);

create policy "créer un abonnement"
  on subscriptions for insert
  with check (auth.uid() = follower_id);

create policy "supprimer un abonnement"
  on subscriptions for delete
  using (auth.uid() = follower_id);

-- Les produits sont visibles par tous les utilisateurs connectés
-- (le filtrage "catalogue de mes abonnements" se fait côté application)
create policy "produits visibles par tous les connectés"
  on products for select
  using (auth.role() = 'authenticated');

-- Seul le propriétaire peut ajouter/modifier/supprimer ses produits
create policy "ajouter ses propres produits"
  on products for insert
  with check (auth.uid() = owner_id);

create policy "modifier ses propres produits"
  on products for update
  using (auth.uid() = owner_id);

create policy "supprimer ses propres produits"
  on products for delete
  using (auth.uid() = owner_id);

-- Les liaisons produit-catégorie suivent les mêmes règles que les produits
create policy "liaisons catégories visibles par tous les connectés"
  on product_categories for select
  using (auth.role() = 'authenticated');

create policy "gérer les catégories de ses propres produits"
  on product_categories for insert
  with check (
    auth.uid() in (select owner_id from products where products.id = product_categories.product_id)
  );

create policy "retirer les catégories de ses propres produits"
  on product_categories for delete
  using (
    auth.uid() in (select owner_id from products where products.id = product_categories.product_id)
  );

-- Emprunts visibles par le propriétaire du produit et l'emprunteur
create policy "voir ses emprunts"
  on loans for select
  using (
    auth.uid() = borrower_id
    or auth.uid() in (select owner_id from products where products.id = loans.product_id)
  );

create policy "déclarer un emprunt"
  on loans for insert
  with check (auth.uid() = borrower_id);

-- ============================================================
-- NOTE : le stockage des photos se fait via un bucket Supabase
-- Storage (ex: "product-photos"), pas dans cette table directement.
-- La colonne photo_url stocke l'URL publique retournée par Storage.
-- ============================================================

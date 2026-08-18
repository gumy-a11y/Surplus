-- ============================================================
-- AJOUT : création automatique du profil à l'inscription
-- ============================================================
-- schema.sql ne contient pas de politique RLS "insert" sur
-- `profiles` (volontairement, car un utilisateur ne doit pas
-- pouvoir se créer n'importe quel profil). La façon standard de
-- résoudre ça côté Supabase est un trigger `security definer` sur
-- `auth.users` qui crée la ligne `profiles` correspondante dès
-- l'inscription, en lisant le pseudo choisi dans les métadonnées
-- passées à `supabase.auth.signUp()`.
--
-- Ce fichier n'existait pas dans schema.sql fourni : il ne modifie
-- aucune table, il ajoute seulement une fonction + un trigger.
-- À exécuter juste après schema.sql dans le SQL Editor Supabase.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, pseudo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'pseudo', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

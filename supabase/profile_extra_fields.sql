-- ============================================================
-- AJOUT : localisation et téléphone sur les profils
-- ============================================================
-- Ajoute trois colonnes à `profiles` (aucune table restructurée,
-- uniquement des colonnes nouvelles) et met à jour le trigger de
-- profile_trigger.sql pour qu'il récupère la ville et
-- l'arrondissement saisis à l'inscription, en plus du pseudo.
-- Le téléphone n'est pas collecté à l'inscription : il reste vide
-- jusqu'à ce que la personne le renseigne depuis « Mon compte ».
--
-- À exécuter après schema.sql, profile_trigger.sql,
-- storage_setup.sql et grants.sql (l'ordre entre eux n'a pas
-- d'importance particulière, mais celui-ci doit passer après
-- profile_trigger.sql puisqu'il remplace sa fonction).
-- ============================================================

alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists arrondissement text;
alter table public.profiles add column if not exists phone text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, pseudo, location, arrondissement)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'pseudo', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'arrondissement'
  );
  return new;
end;
$$;

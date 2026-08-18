-- ============================================================
-- AJOUT : droits d'accès (GRANT) pour le rôle "authenticated"
-- ============================================================
-- schema.sql active RLS et définit des policies, mais RLS ne
-- s'applique qu'après que Postgres ait vérifié que le rôle a le
-- droit d'accéder à la table au niveau SQL de base. Sans ces
-- GRANT, toute requête échoue avec "permission denied" avant
-- même que les policies RLS ne soient évaluées.
--
-- Sur un projet Supabase créé normalement, ces droits sont posés
-- automatiquement pour les tables créées via l'éditeur de tables ;
-- ils peuvent manquer pour des tables créées par SQL direct
-- (comme schema.sql). Ce fichier ne modifie aucune table, il
-- ajoute seulement les autorisations nécessaires pour que les
-- policies RLS déjà en place puissent s'appliquer.
--
-- Les droits accordés ci-dessous correspondent exactement à ce
-- que les policies de schema.sql autorisent déjà (ex : pas de
-- droit "insert" sur profiles, puisque la création se fait via le
-- trigger de profile_trigger.sql, pas directement par l'utilisateur).
-- À exécuter après les 3 fichiers précédents.
-- ============================================================

grant usage on schema public to authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, delete on public.subscriptions to authenticated;
grant select on public.categories to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, delete on public.product_categories to authenticated;
grant select, insert on public.loans to authenticated;

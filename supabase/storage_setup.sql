-- ============================================================
-- AJOUT : bucket de stockage pour les photos de produits
-- ============================================================
-- schema.sql mentionne ce bucket ("product-photos") mais ne le
-- crée pas (c'est un objet Storage, pas une table SQL classique).
-- À exécuter après schema.sql et profile_trigger.sql.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

-- Tout le monde connecté peut voir les photos (bucket public en lecture)
create policy "photos produits visibles par tous"
  on storage.objects for select
  using (bucket_id = 'product-photos');

-- Un utilisateur connecté peut déposer une photo dans son propre
-- dossier (chemin préfixé par son user id : <uid>/xxx.jpg)
create policy "uploader ses propres photos"
  on storage.objects for insert
  with check (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "supprimer ses propres photos"
  on storage.objects for delete
  using (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

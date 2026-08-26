import { createClient } from "@supabase/supabase-js";

// Client "admin", à n'utiliser que côté serveur (route handlers, jamais
// dans un composant "use client" ni exposé au navigateur). La clé
// service_role contourne RLS : c'est ce qui permet de supprimer un
// compte auth.users (et donc, par cascade, profiles/products/…), une
// opération que la clé publique ne peut pas faire.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY n'est pas configurée. Ajoute-la dans les variables d'environnement du projet (jamais avec le préfixe NEXT_PUBLIC_)."
    );
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

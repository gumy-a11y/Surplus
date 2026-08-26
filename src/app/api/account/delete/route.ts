import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur de configuration";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Supprime uniquement le compte de la personne authentifiée — jamais
  // un id fourni par le client. La suppression de auth.users cascade
  // vers profiles, puis vers products/product_categories/subscriptions
  // grâce aux "on delete cascade" de schema.sql. Note : loans.borrower_id
  // n'a pas de cascade dans schema.sql ; la table n'étant pas encore
  // utilisée par l'app, ça ne pose pas de problème aujourd'hui.
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

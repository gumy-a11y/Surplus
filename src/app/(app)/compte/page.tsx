import { createClient } from "@/lib/supabase/server";
import { AccountView } from "@/components/account-view";

export default async function ComptePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("pseudo, phone, location, arrondissement")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <AccountView
      userId={user.id}
      email={user.email ?? ""}
      pseudo={profile?.pseudo ?? ""}
      phone={profile?.phone ?? null}
      location={profile?.location ?? null}
      arrondissement={profile?.arrondissement ?? null}
    />
  );
}

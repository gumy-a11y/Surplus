import { createClient } from "@/lib/supabase/server";
import { FollowList } from "@/components/follow-list";
import { EmptyState } from "@/components/empty-state";

export default async function AbonnementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profiles }, { data: products }, { data: subs }] =
    await Promise.all([
      supabase.from("profiles").select("id, pseudo").neq("id", user.id),
      supabase.from("products").select("owner_id"),
      supabase
        .from("subscriptions")
        .select("followed_id")
        .eq("follower_id", user.id),
    ]);

  const counts = new Map<string, number>();
  (products ?? []).forEach((p) => {
    counts.set(p.owner_id, (counts.get(p.owner_id) ?? 0) + 1);
  });
  const followedIds = new Set((subs ?? []).map((s) => s.followed_id));

  const owners = (profiles ?? [])
    .filter((p) => counts.has(p.id))
    .map((p) => ({
      id: p.id,
      pseudo: p.pseudo,
      count: counts.get(p.id) ?? 0,
      following: followedIds.has(p.id),
    }));

  return (
    <div>
      <p className="mb-3.5 font-mono text-[11px] tracking-[0.18em] text-orange uppercase">
        Personnes ayant publié des objets
      </p>
      {owners.length === 0 ? (
        <EmptyState title="Personne pour l'instant">
          Dès que des proches créent un compte, ils apparaîtront ici.
        </EmptyState>
      ) : (
        <FollowList owners={owners} />
      )}
    </div>
  );
}

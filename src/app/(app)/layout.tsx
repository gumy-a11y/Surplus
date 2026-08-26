import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavTabs } from "@/components/nav-tabs";
import { LogoutButton } from "@/components/logout-button";
import { ToastProvider } from "@/components/toast";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("pseudo")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <ToastProvider>
      <div className="mx-auto w-full max-w-[920px] px-5 pt-7 pb-20">
        {profile ? (
          <div className="fixed top-4 right-4 z-10 flex items-center gap-2.5 font-mono text-[11px] text-concrete">
            <span>
              Connecté comme <b className="text-ink">{profile.pseudo}</b>
            </span>
            <Link
              href="/compte"
              title="Mon compte"
              aria-label="Mon compte"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-card-border bg-card-bg text-ink-dim hover:border-orange hover:text-orange"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
            </Link>
          </div>
        ) : null}

        <p className="mb-1.5 font-mono text-[11px] tracking-[0.18em] text-orange uppercase">
          Chantier partagé entre proches
        </p>
        <h1 className="mb-1 font-display text-[clamp(42px,9vw,64px)] leading-[0.95] tracking-wide">
          LE SUR<span className="text-orange">PLUS</span>
        </h1>
        <p className="mb-6.5 max-w-[520px] text-sm text-ink-dim">
          Ce qui reste après tes travaux peut servir à quelqu&apos;un
          d&apos;autre. Publie, prête, donne.
        </p>

        {profile ? (
          <>
            <NavTabs />
            {children}
          </>
        ) : (
          <div className="rounded-[4px] border border-dashed border-card-border p-8 text-sm text-ink-dim">
            <b className="mb-2 block font-display text-2xl tracking-wide text-ink">
              Profil introuvable
            </b>
            <p className="mb-3">
              Ton compte existe mais aucune ligne <code>profiles</code> ne lui
              correspond (ou n&apos;a pas pu être lue). Vérifie que{" "}
              <code>supabase/profile_trigger.sql</code> a bien été exécuté
              dans l&apos;éditeur SQL Supabase.
            </p>
            <p className="mb-1 font-mono text-[11px] text-concrete">
              user id : {user.id}
            </p>
            {profileError && (
              <p className="mb-3 font-mono text-[11px] text-orange">
                erreur Supabase : [{profileError.code}]{" "}
                {profileError.message}
              </p>
            )}
            <div className="mt-4 flex items-center gap-3">
              <Link href="/login" className="text-orange underline">
                reconnecte-toi
              </Link>
              <span className="text-concrete">·</span>
              <LogoutButton />
            </div>
          </div>
        )}
      </div>
    </ToastProvider>
  );
}

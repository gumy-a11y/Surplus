"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === "signup" && !pseudo.trim()) {
      setError("Choisis un pseudo pour continuer.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { pseudo: pseudo.trim() } },
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (!data.session) {
        setInfo(
          "Compte créé ! Vérifie ta boîte mail pour confirmer ton inscription, puis connecte-toi."
        );
        setMode("login");
        return;
      }
      router.push("/catalogue");
      router.refresh();
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push("/catalogue");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-[380px] rounded-[4px] border border-card-border bg-card-bg p-7">
        <p className="mb-1.5 font-mono text-[11px] tracking-[0.18em] text-orange uppercase">
          Bienvenue
        </p>
        <h1 className="mb-5 font-display text-[34px] tracking-wide">
          {mode === "login" ? "Content de te revoir" : "C'est parti"}
        </h1>

        <div className="mb-5 flex w-fit gap-0.5 overflow-hidden rounded-[2px] border border-card-border">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setInfo(null);
            }}
            className={`border-r border-card-border px-4 py-2 font-mono text-xs uppercase tracking-wide ${
              mode === "login"
                ? "bg-orange font-semibold text-blueprint-deep"
                : "text-ink-dim"
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
              setInfo(null);
            }}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wide ${
              mode === "signup"
                ? "bg-orange font-semibold text-blueprint-deep"
                : "text-ink-dim"
            }`}
          >
            Créer un compte
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="mb-4">
              <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-concrete uppercase">
                Ton pseudo
              </label>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Ex : Marion"
                autoFocus
                className="w-full rounded-[2px] border border-card-border bg-ink/4 px-3 py-2.5 text-[13.5px] text-ink"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-concrete uppercase">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@exemple.com"
              className="w-full rounded-[2px] border border-card-border bg-ink/4 px-3 py-2.5 text-[13.5px] text-ink"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-concrete uppercase">
              Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6 caractères minimum"
              className="w-full rounded-[2px] border border-card-border bg-ink/4 px-3 py-2.5 text-[13.5px] text-ink"
            />
          </div>

          {error && (
            <p className="mb-4 text-[12.5px] text-orange">{error}</p>
          )}
          {info && <p className="mb-4 text-[12.5px] text-green">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[2px] bg-orange px-5 py-3 font-mono text-[12.5px] font-bold tracking-wide text-blueprint-deep uppercase disabled:opacity-40"
          >
            {loading
              ? "Un instant…"
              : mode === "login"
                ? "Entrer dans l'atelier"
                : "Créer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
}

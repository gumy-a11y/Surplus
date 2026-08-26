"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/toast";
import { ARRONDISSEMENTS } from "@/types/database";

function PencilIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function fieldInputClass() {
  return "w-full rounded-[2px] border border-card-border bg-ink/4 px-3 py-2 text-[13.5px] text-ink";
}

export function AccountView({
  userId,
  email,
  pseudo,
  phone,
  location,
  arrondissement,
}: {
  userId: string;
  email: string;
  pseudo: string;
  phone: string | null;
  location: string | null;
  arrondissement: string | null;
}) {
  const router = useRouter();
  const showToast = useToast();

  const [pseudoEditing, setPseudoEditing] = useState(false);
  const [pseudoDraft, setPseudoDraft] = useState(pseudo);
  const [pseudoSaving, setPseudoSaving] = useState(false);

  const [locationEditing, setLocationEditing] = useState(false);
  const [locationDraft, setLocationDraft] = useState(location ?? "");
  const [arrondissementDraft, setArrondissementDraft] = useState(
    arrondissement ?? ""
  );
  const [locationSaving, setLocationSaving] = useState(false);
  const isParisDraft = locationDraft.trim().toLowerCase() === "paris";
  const isParisSaved = (location ?? "").trim().toLowerCase() === "paris";

  const [phoneEditing, setPhoneEditing] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState(phone ?? "");
  const [phoneSaving, setPhoneSaving] = useState(false);

  const [passwordEditing, setPasswordEditing] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [deleteStep, setDeleteStep] = useState<0 | 1>(0);
  const [deleting, setDeleting] = useState(false);

  async function savePseudo() {
    if (!pseudoDraft.trim()) {
      showToast("Le pseudo ne peut pas être vide");
      return;
    }
    setPseudoSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ pseudo: pseudoDraft.trim() })
      .eq("id", userId);
    setPseudoSaving(false);
    if (error) {
      showToast("Erreur : " + error.message);
      return;
    }
    showToast("Pseudo mis à jour");
    setPseudoEditing(false);
    router.refresh();
  }

  async function saveLocation() {
    if (!locationDraft.trim()) {
      showToast("La localisation ne peut pas être vide");
      return;
    }
    setLocationSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        location: locationDraft.trim(),
        arrondissement: isParisDraft && arrondissementDraft
          ? arrondissementDraft
          : null,
      })
      .eq("id", userId);
    setLocationSaving(false);
    if (error) {
      showToast("Erreur : " + error.message);
      return;
    }
    showToast("Localisation mise à jour");
    setLocationEditing(false);
    router.refresh();
  }

  async function savePhone() {
    setPhoneSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ phone: phoneDraft.trim() || null })
      .eq("id", userId);
    setPhoneSaving(false);
    if (error) {
      showToast("Erreur : " + error.message);
      return;
    }
    showToast("Numéro mis à jour");
    setPhoneEditing(false);
    router.refresh();
  }

  async function savePassword() {
    if (newPassword.length < 6) {
      showToast("6 caractères minimum");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Les deux mots de passe ne correspondent pas");
      return;
    }
    setPasswordSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setPasswordSaving(false);
    if (error) {
      showToast("Erreur : " + error.message);
      return;
    }
    showToast("Mot de passe mis à jour");
    setPasswordEditing(false);
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Échec de la suppression du compte");
      }
      router.replace("/login");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      showToast("Erreur : " + message);
      setDeleting(false);
    }
  }

  return (
    <div>
      <p className="mb-3.5 font-mono text-[11px] tracking-[0.18em] text-orange uppercase">
        Mon compte
      </p>

      <div className="mb-6 max-w-[480px] rounded-[4px] border border-card-border bg-card-bg p-5.5">
        {/* Pseudo */}
        <div className="mb-4">
          <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-concrete uppercase">
            Pseudo
          </label>
          {pseudoEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={pseudoDraft}
                onChange={(e) => setPseudoDraft(e.target.value)}
                autoFocus
                className={fieldInputClass()}
              />
              <button
                type="button"
                onClick={savePseudo}
                disabled={pseudoSaving}
                className="rounded-[2px] bg-orange px-3 font-mono text-[11px] font-bold uppercase text-blueprint-deep disabled:opacity-40"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => {
                  setPseudoDraft(pseudo);
                  setPseudoEditing(false);
                }}
                className="rounded-[2px] border border-card-border px-3 font-mono text-[11px] uppercase text-ink-dim"
              >
                Annuler
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[14.5px]">{pseudo}</span>
              <button
                type="button"
                onClick={() => setPseudoEditing(true)}
                aria-label="Modifier le pseudo"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-card-border text-ink-dim hover:border-orange hover:text-orange"
              >
                <PencilIcon />
              </button>
            </div>
          )}
        </div>

        {/* Localisation */}
        <div className="mb-4">
          <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-concrete uppercase">
            Localisation
          </label>
          {locationEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={locationDraft}
                onChange={(e) => setLocationDraft(e.target.value)}
                placeholder="Ex : Paris, Lyon, Rennes…"
                autoFocus
                className={fieldInputClass()}
              />
              {isParisDraft && (
                <select
                  value={arrondissementDraft}
                  onChange={(e) => setArrondissementDraft(e.target.value)}
                  className={fieldInputClass()}
                >
                  <option value="">Choisir un arrondissement…</option>
                  {ARRONDISSEMENTS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveLocation}
                  disabled={locationSaving}
                  className="rounded-[2px] bg-orange px-3 py-1.5 font-mono text-[11px] font-bold uppercase text-blueprint-deep disabled:opacity-40"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLocationDraft(location ?? "");
                    setArrondissementDraft(arrondissement ?? "");
                    setLocationEditing(false);
                  }}
                  className="rounded-[2px] border border-card-border px-3 py-1.5 font-mono text-[11px] uppercase text-ink-dim"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[14.5px] text-ink-dim">
                {location
                  ? isParisSaved && arrondissement
                    ? `${location} (${arrondissement}e)`
                    : location
                  : "Non renseignée"}
              </span>
              <button
                type="button"
                onClick={() => setLocationEditing(true)}
                aria-label="Modifier la localisation"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-card-border text-ink-dim hover:border-orange hover:text-orange"
              >
                <PencilIcon />
              </button>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-concrete uppercase">
            Adresse mail
          </label>
          <p className="text-[14.5px] text-ink-dim">{email}</p>
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-concrete uppercase">
            Téléphone
          </label>
          {phoneEditing ? (
            <div className="flex gap-2">
              <input
                type="tel"
                value={phoneDraft}
                onChange={(e) => setPhoneDraft(e.target.value)}
                placeholder="Ex : 06 12 34 56 78"
                autoFocus
                className={fieldInputClass()}
              />
              <button
                type="button"
                onClick={savePhone}
                disabled={phoneSaving}
                className="rounded-[2px] bg-orange px-3 font-mono text-[11px] font-bold uppercase text-blueprint-deep disabled:opacity-40"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhoneDraft(phone ?? "");
                  setPhoneEditing(false);
                }}
                className="rounded-[2px] border border-card-border px-3 font-mono text-[11px] uppercase text-ink-dim"
              >
                Annuler
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[14.5px] text-ink-dim">
                {phone || "Non renseigné"}
              </span>
              <button
                type="button"
                onClick={() => setPhoneEditing(true)}
                aria-label="Modifier le téléphone"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-card-border text-ink-dim hover:border-orange hover:text-orange"
              >
                <PencilIcon />
              </button>
            </div>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-concrete uppercase">
            Mot de passe
          </label>
          {passwordEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe (6 caractères min.)"
                autoFocus
                className={fieldInputClass()}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le nouveau mot de passe"
                className={fieldInputClass()}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={savePassword}
                  disabled={passwordSaving}
                  className="rounded-[2px] bg-orange px-3 py-1.5 font-mono text-[11px] font-bold uppercase text-blueprint-deep disabled:opacity-40"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordEditing(false);
                  }}
                  className="rounded-[2px] border border-card-border px-3 py-1.5 font-mono text-[11px] uppercase text-ink-dim"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[14.5px] text-ink-dim">••••••••</span>
              <button
                type="button"
                onClick={() => setPasswordEditing(true)}
                aria-label="Modifier le mot de passe"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-card-border text-ink-dim hover:border-orange hover:text-orange"
              >
                <PencilIcon />
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mb-8 rounded-[2px] border border-card-border px-4 py-2.5 font-mono text-[11.5px] uppercase text-ink-dim hover:border-orange hover:text-orange"
      >
        Se déconnecter
      </button>

      <div className="max-w-[480px] rounded-[4px] border border-orange-dim/40 bg-orange-dim/8 p-5.5">
        <p className="mb-1.5 font-mono text-[11px] tracking-wide text-orange-dim uppercase">
          Zone de danger
        </p>
        <p className="mb-3.5 text-[13px] text-ink-dim">
          Supprime définitivement ton compte, ton profil et tous les objets
          que tu as publiés. Impossible à annuler.
        </p>
        {deleteStep === 0 ? (
          <button
            type="button"
            onClick={() => setDeleteStep(1)}
            className="rounded-[2px] border border-orange-dim px-4 py-2 font-mono text-[11.5px] uppercase text-orange-dim hover:bg-orange-dim/10"
          >
            Supprimer mon compte
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[13px] text-ink">
              Confirmer la suppression définitive ?
            </span>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="rounded-[2px] bg-orange-dim px-4 py-2 font-mono text-[11.5px] font-bold uppercase text-blueprint-deep disabled:opacity-40"
            >
              {deleting ? "Suppression…" : "Oui, tout supprimer"}
            </button>
            <button
              type="button"
              onClick={() => setDeleteStep(0)}
              disabled={deleting}
              className="rounded-[2px] border border-card-border px-4 py-2 font-mono text-[11.5px] uppercase text-ink-dim"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

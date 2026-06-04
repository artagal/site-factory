"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { Bookmark } from "lucide-react";
import { observeUser } from "../../lib/auth";
import { isFirebaseConfigured } from "../../lib/firebase";
import { savePlanForUser } from "../../lib/firestore";
import { trackEvent } from "../../lib/analytics";
import type { SuggestedPlan } from "../../types/deals";

export function SavePlanButton({ plan }: { plan: SuggestedPlan }) {
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => observeUser(setUser), []);

  async function savePlan() {
    if (!isFirebaseConfigured()) {
      setStatus("Live account sync is not connected yet. You can still use this plan.");
      return;
    }

    if (!user) {
      setStatus("Sign in to save this plan.");
      return;
    }

    setBusy(true);
    try {
      await savePlanForUser(user.uid, plan);
      trackEvent("plan_saved", { planId: plan.id, source: plan.source });
      setSaved(true);
      setStatus("Saved to your profile.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save this plan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-5 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={busy || saved}
        onClick={savePlan}
        type="button"
      >
        <Bookmark aria-hidden="true" size={18} />
        {saved ? "Plan saved" : "Save plan"}
      </button>
      {status ? <p className="mt-2 max-w-xs text-xs font-bold leading-5 text-lime-100">{status}</p> : null}
    </div>
  );
}

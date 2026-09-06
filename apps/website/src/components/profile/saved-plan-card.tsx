"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { User } from "firebase/auth";
import { ArrowRight, ChevronDown, ChevronUp, LoaderCircle, Trash2 } from "lucide-react";
import type { SavedPlanRecord } from "../../lib/firestore";

export function SavedPlanCard({ item, user, onDeleted }: {
  item: SavedPlanRecord;
  user: User;
  onDeleted: (planId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const detailId = useId();
  const mounted = useRef(true);
  const deleting = useRef(false);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const plan = item.planSnapshot;
  const steps = Array.isArray(plan.items) ? plan.items : [];
  const backups = Array.isArray(plan.backupSuggestions) ? plan.backupSuggestions : [];

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function deletePlan() {
    if (deleting.current) return;
    deleting.current = true;
    setBusy(true);
    setError("");
    try {
      const token = await user.getIdToken();
      if (!mounted.current) return;
      const response = await fetch("/api/me/saved-plans", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ planId: item.planId })
      });
      if (!response.ok) throw new Error("Could not delete this saved plan. Please try again.");
      if (mounted.current) onDeleted(item.planId);
    } catch {
      if (mounted.current) setError("Could not delete this saved plan. Please try again.");
    } finally {
      deleting.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return (
    <article className="min-w-0 border-b border-[var(--border-subtle)] py-4 [overflow-wrap:anywhere]">
      <h4 className="text-base font-semibold">{plan.title || "Saved plan"}</h4>
      {plan.summary ? <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{plan.summary}</p> : null}
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        {[plan.input?.city, plan.estimatedTotalBudget, plan.estimatedTotalTime].filter(Boolean).join(" | ")}
      </p>
      {plan.source === "demo" ? <p className="mt-2 text-sm font-semibold">Demo plan</p> : null}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <button
          aria-controls={detailId}
          aria-expanded={expanded}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline"
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          {expanded ? <ChevronUp aria-hidden="true" size={18} /> : <ChevronDown aria-hidden="true" size={18} />}
          {expanded ? "Close saved plan" : "View saved plan"}
        </button>
        <button
          aria-label={`Delete saved plan: ${plan.title || "Saved plan"}`}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--border-subtle)] disabled:opacity-50"
          disabled={busy}
          onClick={() => { setConfirming(true); setError(""); }}
          ref={deleteButton}
          title="Delete saved plan"
          type="button"
        >
          <Trash2 aria-hidden="true" size={18} />
        </button>
      </div>
      {confirming ? (
        <div className="mt-3" role="group" aria-label={`Confirm deletion of ${plan.title || "saved plan"}`}>
          <p className="text-sm">Delete this saved plan? This cannot be undone.</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <button className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline disabled:opacity-50" disabled={busy} onClick={() => void deletePlan()} type="button">
              {busy ? <LoaderCircle aria-hidden="true" className="animate-spin" size={18} /> : <Trash2 aria-hidden="true" size={18} />}
              {busy ? "Deleting..." : "Delete plan"}
            </button>
            <button className="min-h-11 text-sm font-semibold underline disabled:opacity-50" disabled={busy} onClick={() => { setConfirming(false); setError(""); deleteButton.current?.focus(); }} type="button">Cancel</button>
          </div>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-sm text-[var(--accent-amber)]" role="alert">{error}</p> : null}
      <div hidden={!expanded} id={detailId} className="mt-4">
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">Saved itinerary. Prices, opening hours, and availability may have changed.</p>
        {plan.whyItFits ? <p className="mt-2 text-sm leading-6">{plan.whyItFits}</p> : null}
        {steps.length ? (
          <ol className="mt-4 space-y-4">
            {steps.map((step, index) => (
              <li className="border-l-2 border-[var(--border-subtle)] pl-4" key={`${index}-${step.listingId ?? step.title}`}>
                <h5 className="font-semibold">{index + 1}. {step.title}</h5>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{[step.category, step.time, step.estimatedPrice].filter(Boolean).join(" | ")}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6">{step.description}</p>
                {step.whyItFits ? <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{step.whyItFits}</p> : null}
                {step.ctaHref && /^\/deals\/[a-zA-Z0-9_-]+$/.test(step.ctaHref) ? (
                  <Link className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline" href={step.ctaHref} prefetch={false}>
                    View Deal <ArrowRight aria-hidden="true" size={16} />
                  </Link>
                ) : null}
              </li>
            ))}
          </ol>
        ) : <p className="mt-3 text-sm">This saved plan has no itinerary details.</p>}
        {backups.length ? (
          <div className="mt-5">
            <h5 className="font-semibold">Backup options</h5>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6">
              {backups.map((backup, index) => <li key={index}>{backup}</li>)}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}

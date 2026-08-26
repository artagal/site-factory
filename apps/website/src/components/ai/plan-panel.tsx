"use client";

import Link from "next/link";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { formatBudget, formatIndoorOutdoor, formatWhen } from "../../lib/format";
import type { PlanFinderInput, SuggestedPlan } from "../../types/deals";
import { SavePlanButton } from "../planner/save-plan-button";
import { ShareButton } from "../shared/share-button";

type PlanResponse = {
  error?: string;
  plan?: SuggestedPlan;
  provider?: "openai" | "rules";
  setupWarning?: string | null;
};

export function PlanPanel({ initialPlan, input }: { initialPlan: SuggestedPlan; input: PlanFinderInput }) {
  const [plan, setPlan] = useState(initialPlan);
  const [provider, setProvider] = useState<"openai" | "rules">("rules");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function personalize() {
    if (busy) return;
    setBusy(true);
    setStatus("Checking approved local listings...");
    try {
      const response = await fetch("/api/plan", {
        body: JSON.stringify(input),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const result = (await response.json().catch(() => null)) as PlanResponse | null;
      if (!response.ok || !result?.plan) {
        setStatus(result?.error ?? "Could not update this plan yet.");
        return;
      }
      setPlan(result.plan);
      setProvider(result.provider ?? "rules");
      setStatus(result.provider === "openai"
        ? "Your plan is updated. Confirm availability with each partner."
        : result.plan.waitlistRecommended
          ? "No matching offers yet. These are general ideas, not confirmed bookings."
          : "Your matched plan is ready. AI personalization is unavailable right now.");
    } catch {
      setStatus("Could not update this plan yet. Your current plan is still available.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10 border-t border-white/10 pt-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Your deal plan</p>
            <span className="rounded-full bg-white/[0.08] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white/54">
              {provider === "openai" ? "AI matched" : plan.source === "demo" ? "Demo ideas" : plan.waitlistRecommended ? "Ideas only" : "Matched to you"}
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-black leading-tight text-white md:text-3xl">{plan.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">{plan.summary}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-black text-white/58">
          <span className="rounded-2xl bg-black/28 p-3">{formatWhen(input.when)}</span>
          <span className="rounded-2xl bg-black/28 p-3">{formatBudget(input.budget)}</span>
          <span className="rounded-2xl bg-black/28 p-3">{formatIndoorOutdoor(input.indoorOutdoor)}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {plan.items.map((item, index) => (
          <article className="rounded-lg border border-white/10 bg-white/[0.04] p-5" key={`${item.listingId ?? item.title}-${index}`}>
            <span className="text-xs font-black uppercase tracking-[0.16em] text-lime-200">Option {index + 1}</span>
            <h3 className="mt-3 text-xl font-bold text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/60">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-white/58">
              <span className="rounded-full bg-white/[0.07] px-3 py-1.5">{item.time}</span>
              <span className="rounded-full bg-white/[0.07] px-3 py-1.5">{item.estimatedPrice}</span>
            </div>
            {item.ctaHref ? (
              <Link className="mt-4 inline-flex min-h-10 items-center text-sm font-black text-lime-200 hover:text-white" href={item.ctaHref}>
                {item.ctaLabel}
              </Link>
            ) : null}
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white disabled:opacity-55"
          disabled={busy}
          onClick={() => void personalize()}
          type="button"
        >
          <Sparkles aria-hidden="true" size={18} />
          {busy ? "Building..." : "Personalize with AI"}
        </button>
        <SavePlanButton plan={plan} />
        <ShareButton label="Share plan" text={plan.summary} title={plan.title} />
        <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#070816] hover:bg-lime-200" href="/deals">
          <Send aria-hidden="true" size={18} />
          Browse deals
        </Link>
      </div>
      {status ? <p aria-live="polite" className="mt-4 rounded-2xl bg-black/24 p-3 text-xs font-bold leading-5 text-white/58">{status}</p> : null}
    </section>
  );
}

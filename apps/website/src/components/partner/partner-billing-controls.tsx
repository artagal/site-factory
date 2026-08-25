"use client";

import { CreditCard, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUserIdToken } from "../../lib/auth";
import { canStartPartnerCheckout, normalizePartnerSubscriptionStatus } from "../../lib/stripe-billing";
import type { Business } from "../../types/deals";

type BillingStatus = {
  checkoutAvailable: boolean;
  paidAccessEnabled: boolean;
  portalAvailable: boolean;
  pricingTier: "starter" | "growth" | "pro";
  subscriptionCancelAtPeriodEnd: boolean;
  subscriptionCurrentPeriodEnd: string | null;
  subscriptionStatus: string | null;
};

type BillingPayload = Partial<BillingStatus> & {
  error?: string;
  ok?: boolean;
  url?: string;
};

export function PartnerBillingControls({ business }: { business: Business }) {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [busy, setBusy] = useState<"growth" | "pro" | "portal" | "">("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBilling() {
      try {
        const token = await getCurrentUserIdToken();
        if (!token) return;
        const response = await fetch(`/api/partner/billing?businessId=${encodeURIComponent(business.id)}`, {
          headers: { authorization: `Bearer ${token}` }
        });
        const payload = await response.json() as BillingPayload;
        if (!cancelled && response.ok) setBilling(payload as BillingStatus);
        if (!cancelled && !response.ok) setNotice(payload.error ?? "Could not load billing status.");
      } catch {
        if (!cancelled) setNotice("Could not load billing status.");
      }
    }

    if (!business.isDemo) void loadBilling();
    return () => {
      cancelled = true;
    };
  }, [business.id, business.isDemo]);

  async function openBilling(path: "checkout" | "portal", tier?: "growth" | "pro") {
    if (busy) return;
    setBusy(path === "portal" ? "portal" : tier ?? "growth");
    setNotice("");

    try {
      const token = await getCurrentUserIdToken();
      if (!token) {
        setNotice("Sign in again before managing billing.");
        return;
      }

      const response = await fetch(`/api/partner/billing/${path}`, {
        body: JSON.stringify({ businessId: business.id, ...(tier ? { tier } : {}) }),
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json"
        },
        method: "POST"
      });
      const payload = await response.json() as BillingPayload;
      if (!response.ok || !payload.url) {
        setNotice(payload.error ?? "Could not open Stripe billing.");
        return;
      }
      window.location.assign(payload.url);
    } catch {
      setNotice("Could not open Stripe billing.");
    } finally {
      setBusy("");
    }
  }

  if (business.isDemo) return null;

  if (!billing) {
    return notice
      ? <p className="mt-4 rounded-2xl bg-amber-300/12 p-3 text-xs font-bold leading-5 text-amber-100">{notice}</p>
      : <div className="mt-4 h-11 animate-pulse rounded-2xl bg-white/[0.06]" aria-label="Loading billing status" />;
  }

  if (!billing.checkoutAvailable) {
    return (
      <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-xs font-bold leading-5 text-white/56">
        Partner billing is being configured. Starter access remains active.
      </p>
    );
  }

  const canStartCheckout = canStartPartnerCheckout(
    normalizePartnerSubscriptionStatus(billing.subscriptionStatus)
  );

  return (
    <div className="mt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {!canStartCheckout ? (
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-lime-300 px-4 text-sm font-black text-[#070816] hover:bg-white disabled:cursor-wait disabled:opacity-60 sm:col-span-2"
            disabled={!billing.portalAvailable || Boolean(busy)}
            onClick={() => void openBilling("portal")}
            type="button"
          >
            {busy === "portal" ? <LoaderCircle aria-hidden="true" className="animate-spin" size={17} /> : <CreditCard aria-hidden="true" size={17} />}
            Manage billing
          </button>
        ) : (
          <>
            <button
              className="min-h-11 rounded-2xl bg-lime-300 px-4 text-sm font-black text-[#070816] hover:bg-white disabled:cursor-wait disabled:opacity-60"
              disabled={Boolean(busy)}
              onClick={() => void openBilling("checkout", "growth")}
              type="button"
            >
              {busy === "growth" ? "Opening..." : "Growth - $29/mo"}
            </button>
            <button
              className="min-h-11 rounded-2xl border border-cyan-300/24 bg-cyan-300/10 px-4 text-sm font-black text-cyan-100 hover:bg-cyan-300/18 disabled:cursor-wait disabled:opacity-60"
              disabled={Boolean(busy)}
              onClick={() => void openBilling("checkout", "pro")}
              type="button"
            >
              {busy === "pro" ? "Opening..." : "Pro - $99/mo"}
            </button>
            {billing.portalAvailable ? (
              <button
                className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-black text-white hover:bg-white/10 disabled:cursor-wait disabled:opacity-60 sm:col-span-2"
                disabled={Boolean(busy)}
                onClick={() => void openBilling("portal")}
                type="button"
              >
                Manage previous billing
              </button>
            ) : null}
          </>
        )}
      </div>
      {billing.subscriptionCancelAtPeriodEnd ? (
        <p className="mt-3 text-xs font-bold text-amber-100">Cancellation is scheduled for the end of the current billing period.</p>
      ) : null}
      {notice ? <p className="mt-3 text-xs font-bold text-amber-100">{notice}</p> : null}
    </div>
  );
}

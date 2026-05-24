"use client";

import { useState } from "react";
import type { PaidPartnerPricingTier } from "../../lib/payments";

export function PartnerCheckoutButton({
  businessId,
  className = "",
  email,
  label = "Start Checkout",
  tier
}: {
  businessId?: string;
  className?: string;
  email?: string | null;
  label?: string;
  tier: PaidPartnerPricingTier;
}) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function startCheckout() {
    if (busy) return;

    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/checkout/partner-subscription", {
        body: JSON.stringify({ businessId, email, tier }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const result = (await response.json().catch(() => null)) as { error?: string; url?: string } | null;

      if (!response.ok || !result?.url) {
        setStatus(result?.error ?? "Checkout is not available yet.");
        return;
      }

      window.location.assign(result.url);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button className={className} disabled={busy} onClick={startCheckout} type="button">
        {busy ? "Opening checkout..." : label}
      </button>
      {status ? <p className="mt-3 rounded-2xl bg-black/24 p-3 text-xs font-bold leading-5 text-lime-100">{status}</p> : null}
    </div>
  );
}

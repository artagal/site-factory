"use client";

import { useState } from "react";
import { getCurrentUserIdToken } from "../../lib/auth";

export function PartnerBillingPortalButton({
  businessId,
  className = ""
}: {
  businessId: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function openBilling() {
    if (busy) return;

    setBusy(true);
    setStatus("");
    try {
      const token = await getCurrentUserIdToken();
      if (!token) {
        setStatus("Sign in as a business owner before managing billing.");
        return;
      }

      const response = await fetch("/api/billing/partner-portal", {
        body: JSON.stringify({ businessId }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const result = (await response.json().catch(() => null)) as { error?: string; url?: string } | null;

      if (!response.ok || !result?.url) {
        setStatus(result?.error ?? "Billing portal is not available yet.");
        return;
      }

      window.location.assign(result.url);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Billing portal failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button className={className} disabled={busy} onClick={openBilling} type="button">
        {busy ? "Opening billing..." : "Manage Billing"}
      </button>
      {status ? <p className="mt-3 rounded-2xl bg-black/24 p-3 text-xs font-bold leading-5 text-lime-100">{status}</p> : null}
    </div>
  );
}

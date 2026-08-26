export type PaidTier = "growth" | "pro";
export type BillingProvider = "stripe" | "app_store" | "play_store";

export type PartnerAccessFacts = {
  paidAccessEnabled?: unknown;
  pricingTier?: unknown;
  subscriptionStatus?: unknown;
  subscriptionCurrentPeriodEnd?: unknown;
};

export type PartnerEntitlement = {
  paidAccessEnabled: boolean;
  pricingTier: "starter" | PaidTier;
  subscriptionStatus: "active" | "trialing" | null;
  subscriptionCurrentPeriodEnd: string | null;
  subscriptionProvider: BillingProvider | null;
};

export function billingDate(value: unknown): string | null {
  let date: unknown = value;
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    date = value.toDate();
  }
  const millis = date instanceof Date ? date.getTime() : typeof date === "string" ? Date.parse(date) : NaN;
  return Number.isFinite(millis) ? new Date(millis).toISOString() : null;
}

export function activePartnerTier(facts: PartnerAccessFacts, now = Date.now()): "starter" | PaidTier {
  const end = billingDate(facts.subscriptionCurrentPeriodEnd);
  return facts.paidAccessEnabled === true
    && (facts.pricingTier === "growth" || facts.pricingTier === "pro")
    && (facts.subscriptionStatus === "active" || facts.subscriptionStatus === "trialing")
    && end !== null && Date.parse(end) > now ? facts.pricingTier : "starter";
}

export function billingRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

// Provider facts live in the server-only billing document. A cancellation from
// one provider must not revoke a still-valid subscription from another provider.
export function resolvePartnerEntitlement(billing: Record<string, unknown>, now = Date.now()): PartnerEntitlement {
  const native = billingRecord(billing.nativeSubscription);
  const sources: Array<PartnerAccessFacts & Record<string, unknown>> = [
    { ...billing, paidAccessEnabled: true, subscriptionProvider: "stripe" },
    { ...native, paidAccessEnabled: true, subscriptionProvider: native.store }
  ];
  const valid = sources.filter((source) => activePartnerTier(source, now) !== "starter"
    && ["stripe", "app_store", "play_store"].includes(String(source.subscriptionProvider)));
  valid.sort((a, b) => {
    const rank = (source: PartnerAccessFacts) => source.pricingTier === "pro" ? 2 : 1;
    return rank(b) - rank(a)
      || Date.parse(billingDate(b.subscriptionCurrentPeriodEnd)!) - Date.parse(billingDate(a.subscriptionCurrentPeriodEnd)!);
  });
  const best = valid[0];
  return best ? {
    paidAccessEnabled: true,
    pricingTier: best.pricingTier as PaidTier,
    subscriptionStatus: best.subscriptionStatus as "active" | "trialing",
    subscriptionCurrentPeriodEnd: billingDate(best.subscriptionCurrentPeriodEnd),
    subscriptionProvider: best.subscriptionProvider as BillingProvider
  } : {
    paidAccessEnabled: false,
    pricingTier: "starter",
    subscriptionStatus: null,
    subscriptionCurrentPeriodEnd: null,
    subscriptionProvider: null
  };
}

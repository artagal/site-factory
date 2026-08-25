import type { PaidPartnerPricingTier } from "./payments";
import type { PartnerSubscriptionStatus } from "../types/deals";

const PAID_SUBSCRIPTION_STATUSES = new Set<PartnerSubscriptionStatus>(["active", "trialing"]);
const RESTARTABLE_SUBSCRIPTION_STATUSES = new Set<PartnerSubscriptionStatus>(["canceled", "incomplete_expired"]);

export function normalizePartnerSubscriptionStatus(value: unknown): PartnerSubscriptionStatus | null {
  if (
    value === "active"
    || value === "trialing"
    || value === "past_due"
    || value === "unpaid"
    || value === "canceled"
    || value === "incomplete"
    || value === "incomplete_expired"
    || value === "paused"
  ) {
    return value;
  }
  return null;
}

export function hasPaidPartnerAccess(status: PartnerSubscriptionStatus | null | undefined) {
  return Boolean(status && PAID_SUBSCRIPTION_STATUSES.has(status));
}

export function canStartPartnerCheckout(status: PartnerSubscriptionStatus | null | undefined) {
  return !status || RESTARTABLE_SUBSCRIPTION_STATUSES.has(status);
}

export function stripePriceIdForPartnerTier(
  tier: PaidPartnerPricingTier,
  environment: NodeJS.ProcessEnv = process.env
) {
  const value = tier === "growth" ? environment.STRIPE_GROWTH_PRICE_ID : environment.STRIPE_PRO_PRICE_ID;
  return value?.trim() || null;
}

export function partnerTierForStripePriceId(
  priceId: string | null | undefined,
  environment: NodeJS.ProcessEnv = process.env
): PaidPartnerPricingTier | null {
  if (!priceId) return null;
  if (priceId === stripePriceIdForPartnerTier("growth", environment)) return "growth";
  if (priceId === stripePriceIdForPartnerTier("pro", environment)) return "pro";
  return null;
}

export function isPartnerBillingConfigured(environment: NodeJS.ProcessEnv = process.env) {
  return Boolean(
    environment.STRIPE_SECRET_KEY?.trim()
    && environment.STRIPE_WEBHOOK_SECRET?.trim()
    && stripePriceIdForPartnerTier("growth", environment)
    && stripePriceIdForPartnerTier("pro", environment)
  );
}

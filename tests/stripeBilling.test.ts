import { describe, expect, it } from "vitest";
import {
  canStartPartnerCheckout,
  hasPaidPartnerAccess,
  isPartnerBillingConfigured,
  normalizePartnerSubscriptionStatus,
  partnerTierForStripePriceId,
  stripePriceIdForPartnerTier
} from "../apps/website/src/lib/stripe-billing";
import { getStripeReturnOrigin } from "../apps/website/src/lib/server/stripe";

const configuredEnvironment = {
  NODE_ENV: "test",
  STRIPE_GROWTH_PRICE_ID: "price_growth",
  STRIPE_PRO_PRICE_ID: "price_pro",
  STRIPE_SECRET_KEY: "sk_test_example",
  STRIPE_WEBHOOK_SECRET: "whsec_example"
} satisfies NodeJS.ProcessEnv;

describe("Stripe partner billing policy", () => {
  it("maps only configured server-side price IDs to paid tiers", () => {
    expect(stripePriceIdForPartnerTier("growth", configuredEnvironment)).toBe("price_growth");
    expect(partnerTierForStripePriceId("price_pro", configuredEnvironment)).toBe("pro");
    expect(partnerTierForStripePriceId("price_attacker", configuredEnvironment)).toBeNull();
  });

  it("fails closed for unpaid and unknown subscription states", () => {
    expect(hasPaidPartnerAccess("active")).toBe(true);
    expect(hasPaidPartnerAccess("trialing")).toBe(true);
    expect(hasPaidPartnerAccess("past_due")).toBe(false);
    expect(normalizePartnerSubscriptionStatus("future_status")).toBeNull();
  });

  it("prevents duplicate checkout while a subscription needs portal management", () => {
    expect(canStartPartnerCheckout(null)).toBe(true);
    expect(canStartPartnerCheckout("canceled")).toBe(true);
    expect(canStartPartnerCheckout("incomplete_expired")).toBe(true);
    expect(canStartPartnerCheckout("active")).toBe(false);
    expect(canStartPartnerCheckout("past_due")).toBe(false);
  });

  it("requires secret, webhook, and both price IDs before enabling checkout", () => {
    expect(isPartnerBillingConfigured(configuredEnvironment)).toBe(true);
    expect(isPartnerBillingConfigured({ ...configuredEnvironment, STRIPE_WEBHOOK_SECRET: "" })).toBe(false);
  });

  it("only returns to the canonical or current project deployment host", () => {
    const attackerRequest = new Request("https://unrelated-project.vercel.app/api/partner/billing/checkout");
    const previewRequest = new Request("https://site-factory-preview.vercel.app/api/partner/billing/checkout");

    expect(getStripeReturnOrigin(attackerRequest, configuredEnvironment)).toBe("https://gofunmotion.com");
    expect(getStripeReturnOrigin(previewRequest, {
      ...configuredEnvironment,
      VERCEL_URL: "site-factory-preview.vercel.app"
    })).toBe("https://site-factory-preview.vercel.app");
  });
});

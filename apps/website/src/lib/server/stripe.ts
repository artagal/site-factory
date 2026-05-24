import Stripe from "stripe";
import { getStripePriceEnvName, type PaidPartnerPricingTier } from "../payments";

let stripeClient: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    appInfo: {
      name: "GoFunMotion Deals"
    }
  });
  return stripeClient;
}

export function getPartnerSubscriptionPriceId(tier: PaidPartnerPricingTier) {
  const envName = getStripePriceEnvName(tier);
  return process.env[envName] ?? null;
}

export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}

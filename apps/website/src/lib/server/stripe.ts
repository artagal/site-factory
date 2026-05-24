import Stripe from "stripe";
import { getStripePriceEnvName, type PaidPartnerPricingTier } from "../payments";

let stripeClient: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return null;
  stripeClient ??= new Stripe(secretKey, {
    appInfo: {
      name: "GoFunMotion Deals"
    }
  });
  return stripeClient;
}

export function getPartnerSubscriptionPriceId(tier: PaidPartnerPricingTier) {
  const envName = getStripePriceEnvName(tier);
  return process.env[envName]?.trim() ?? null;
}

export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? null;
}

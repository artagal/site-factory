import Stripe from "stripe";
import { getStripePriceEnvName, type PaidPartnerPricingTier } from "../payments";

let stripeClient: Stripe | null = null;

export function cleanStripeEnvValue(value: string | undefined) {
  return value?.replace(/[^\x21-\x7e]/g, "").trim() ?? "";
}

export function isStripeConfigured() {
  return Boolean(cleanStripeEnvValue(process.env.STRIPE_SECRET_KEY));
}

export function getStripeClient() {
  const secretKey = cleanStripeEnvValue(process.env.STRIPE_SECRET_KEY);
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
  return cleanStripeEnvValue(process.env[envName]) || null;
}

export function getStripeWebhookSecret() {
  return cleanStripeEnvValue(process.env.STRIPE_WEBHOOK_SECRET) || null;
}

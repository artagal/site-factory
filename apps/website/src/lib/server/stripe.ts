import Stripe from "stripe";

let stripeClient: Stripe | null = null;
let stripeClientKey = "";

export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  if (!key.startsWith("sk_")) return null;

  if (!stripeClient || stripeClientKey !== key) {
    stripeClient = new Stripe(key, {
      appInfo: {
        name: "GoFunMotion Deals",
        url: "https://gofunmotion.com"
      },
      maxNetworkRetries: 2,
      timeout: 12_000
    });
    stripeClientKey = key;
  }

  return stripeClient;
}

export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
}

function hostnameFromEnvironmentValue(value: string | undefined) {
  if (!value) return null;
  try {
    return new URL(value.includes("://") ? value : `https://${value}`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function getStripeReturnOrigin(
  request: Request,
  environment: NodeJS.ProcessEnv = process.env
) {
  const requestUrl = new URL(request.url);
  const hostname = requestUrl.hostname.toLowerCase();
  const allowedHosts = new Set([
    "gofunmotion.com",
    "www.gofunmotion.com",
    "localhost",
    "127.0.0.1",
    hostnameFromEnvironmentValue(environment.VERCEL_URL),
    hostnameFromEnvironmentValue(environment.VERCEL_BRANCH_URL),
    hostnameFromEnvironmentValue(environment.VERCEL_PROJECT_PRODUCTION_URL)
  ].filter((value): value is string => Boolean(value)));

  if (allowedHosts.has(hostname)) {
    return requestUrl.origin;
  }

  for (const candidate of [environment.NEXT_PUBLIC_SITE_URL, environment.SITE_FACTORY_BASE_URL]) {
    if (!candidate) continue;
    try {
      const configured = new URL(candidate);
      if (configured.protocol === "https:" || configured.hostname === "localhost") return configured.origin;
    } catch {
      // Ignore invalid optional configuration and use the canonical fallback.
    }
  }

  return "https://gofunmotion.com";
}

import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { getFirebaseAdminDb, verifyBearerToken } from "../../../../lib/server/firebase-admin";
import { cleanStripeEnvValue, getPartnerSubscriptionPriceId, getStripeClient } from "../../../../lib/server/stripe";
import type { PaidPartnerPricingTier } from "../../../../lib/payments";

const allowedTiers = new Set<PaidPartnerPricingTier>(["growth", "pro"]);

function getBaseUrl(request: Request) {
  const configured = cleanStripeEnvValue(process.env.NEXT_PUBLIC_SITE_URL) ||
    cleanStripeEnvValue(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (configured) return configured.startsWith("http") ? configured : `https://${configured}`;

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

async function verifyBusinessCheckoutAccess(request: Request, businessId: string) {
  const db = getFirebaseAdminDb();
  if (!db) {
    return { error: "Live billing is not connected to this business yet.", status: 503 };
  }

  const token = await verifyBearerToken(request);
  if (!token) {
    return { error: "Sign in before upgrading a business plan.", status: 401 };
  }

  const snapshot = await db.collection("businesses").doc(businessId).get();
  const ownerIds = snapshot.exists && Array.isArray(snapshot.data()?.ownerIds)
    ? snapshot.data()?.ownerIds.map(String)
    : [];

  if (!ownerIds.includes(token.uid)) {
    return { error: "Only a business owner can start checkout for this business.", status: 403 };
  }

  return null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    businessId?: unknown;
    email?: unknown;
    tier?: unknown;
  } | null;

  const tier = typeof body?.tier === "string" ? body.tier : "";
  if (!allowedTiers.has(tier as PaidPartnerPricingTier)) {
    return jsonError("Choose Growth or Pro to start paid partner checkout.", 400);
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return jsonError("Stripe is not configured. Add STRIPE_SECRET_KEY and tier price IDs before paid checkout.", 503);
  }

  const priceId = getPartnerSubscriptionPriceId(tier as PaidPartnerPricingTier);
  if (!priceId) {
    return jsonError(`Stripe price ID is missing for ${tier}.`, 503);
  }

  const email = typeof body?.email === "string" && body.email.includes("@") ? body.email : undefined;
  const businessId = typeof body?.businessId === "string" ? body.businessId : undefined;
  if (businessId) {
    const accessError = await verifyBusinessCheckoutAccess(request, businessId);
    if (accessError) return jsonError(accessError.error, accessError.status);
  }

  const baseUrl = getBaseUrl(request);

  const session = await stripe.checkout.sessions.create({
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    cancel_url: `${baseUrl}/pricing?checkout=cancelled&tier=${tier}`,
    customer_email: email,
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    metadata: {
      businessId: businessId ?? "",
      product: "partner_subscription",
      tier
    },
    mode: "subscription",
    subscription_data: {
      metadata: {
        businessId: businessId ?? "",
        product: "partner_subscription",
        tier
      }
    },
    success_url: `${baseUrl}/pricing?checkout=success&tier=${tier}&session_id={CHECKOUT_SESSION_ID}`
  });

  return jsonOk({ url: session.url }, 201);
}

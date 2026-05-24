import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { getFirebaseAdminDb, verifyBearerToken } from "../../../../lib/server/firebase-admin";
import { getStripeClient } from "../../../../lib/server/stripe";

function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (configured) return configured.startsWith("http") ? configured : `https://${configured}`;

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    businessId?: unknown;
  } | null;

  const businessId = typeof body?.businessId === "string" ? body.businessId : "";
  if (!businessId) return jsonError("Choose a business before opening billing.", 400);

  const stripe = getStripeClient();
  if (!stripe) {
    return jsonError("Stripe is not configured. Add STRIPE_SECRET_KEY before opening billing.", 503);
  }

  const db = getFirebaseAdminDb();
  if (!db) {
    return jsonError("Firebase Admin is required before partner billing can be managed.", 503);
  }

  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in before managing billing.", 401);

  const snapshot = await db.collection("businesses").doc(businessId).get();
  const data = snapshot.data();
  const ownerIds = Array.isArray(data?.ownerIds) ? data.ownerIds.map(String) : [];
  if (!snapshot.exists || !ownerIds.includes(token.uid)) {
    return jsonError("Only a business owner can manage billing for this business.", 403);
  }

  const stripeCustomerId = typeof data?.stripeCustomerId === "string" ? data.stripeCustomerId : "";
  if (!stripeCustomerId) {
    return jsonError("No Stripe customer is connected to this business yet.", 400);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${getBaseUrl(request)}/partner/dashboard?billing=returned`
  });

  return jsonOk({ url: session.url }, 201);
}

import { jsonError, jsonOk } from "../../../../../lib/server/api-response";
import { verifyApprovedPartnerBusiness } from "../../../../../lib/server/partner-business-access";
import { getStripeClient, getStripeReturnOrigin } from "../../../../../lib/server/stripe";

export const runtime = "nodejs";

function clean(value: unknown, max = 140) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const businessId = clean(body?.businessId);
  if (!businessId) return jsonError("Choose a business before opening billing.", 400);

  const verified = await verifyApprovedPartnerBusiness(request, businessId);
  if ("error" in verified) return verified.error;

  const stripe = getStripeClient();
  if (!stripe) return jsonError("Partner billing is not available yet.", 503);

  const billingSnapshot = await verified.db.collection("businessBilling").doc(businessId).get();
  const customerId = clean(billingSnapshot.data()?.stripeCustomerId);
  if (!customerId) return jsonError("No Stripe billing account is attached to this business yet.", 409);

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getStripeReturnOrigin(request)}/partner/dashboard`
    });
    return jsonOk({ url: session.url });
  } catch (error) {
    console.error("stripe_billing_portal_failed", {
      businessId,
      error: error instanceof Error ? error.message : "unknown"
    });
    return jsonError("Could not open the Stripe billing portal. Try again shortly.", 502);
  }
}

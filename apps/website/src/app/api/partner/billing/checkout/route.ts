import type { PaidPartnerPricingTier } from "../../../../../lib/payments";
import {
  canStartPartnerCheckout,
  isPartnerBillingConfigured,
  normalizePartnerSubscriptionStatus,
  stripePriceIdForPartnerTier
} from "../../../../../lib/stripe-billing";
import { jsonError, jsonOk } from "../../../../../lib/server/api-response";
import { verifyApprovedPartnerBusiness } from "../../../../../lib/server/partner-business-access";
import { getStripeClient, getStripeReturnOrigin } from "../../../../../lib/server/stripe";

export const runtime = "nodejs";

function clean(value: unknown, max = 254) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const businessId = clean(body?.businessId, 140);
  const tier = clean(body?.tier, 20) as PaidPartnerPricingTier;

  if (!businessId) return jsonError("Choose a business before starting checkout.", 400);
  if (tier !== "growth" && tier !== "pro") return jsonError("Choose Growth or Pro before starting checkout.", 400);

  const verified = await verifyApprovedPartnerBusiness(request, businessId);
  if ("error" in verified) return verified.error;

  const stripe = getStripeClient();
  const priceId = stripePriceIdForPartnerTier(tier);
  if (!stripe || !priceId || !isPartnerBillingConfigured()) {
    return jsonError("Partner billing is not available yet.", 503);
  }

  const billingRef = verified.db.collection("businessBilling").doc(businessId);
  const billingSnapshot = await billingRef.get();
  const billing = billingSnapshot.data() ?? {};
  const subscriptionStatus = normalizePartnerSubscriptionStatus(billing.subscriptionStatus);

  if (!canStartPartnerCheckout(subscriptionStatus)) {
    return jsonError("Manage the existing subscription from the billing portal before starting another plan.", 409);
  }

  const metadata = {
    gofunmotionBusinessId: businessId,
    gofunmotionOwnerUid: verified.token.uid,
    gofunmotionTier: tier
  };
  const customerId = clean(billing.stripeCustomerId, 140);
  const origin = getStripeReturnOrigin(request);

  try {
    const session = await stripe.checkout.sessions.create({
      allow_promotion_codes: true,
      cancel_url: `${origin}/partner/dashboard?billing=cancelled`,
      client_reference_id: businessId,
      ...(customerId
        ? { customer: customerId }
        : { customer_email: clean(verified.business.email ?? verified.token.email, 254) || undefined }),
      line_items: [{ price: priceId, quantity: 1 }],
      metadata,
      mode: "subscription",
      subscription_data: { metadata },
      success_url: `${origin}/partner/dashboard?billing=success`
    });

    if (!session.url) return jsonError("Stripe did not return a checkout URL.", 502);

    await billingRef.set(
      {
        lastCheckoutSessionId: session.id,
        requestedTier: tier,
        updatedAt: new Date()
      },
      { merge: true }
    );

    return jsonOk({ url: session.url });
  } catch (error) {
    console.error("stripe_checkout_session_failed", {
      businessId,
      error: error instanceof Error ? error.message : "unknown"
    });
    return jsonError("Could not start Stripe checkout. Try again shortly.", 502);
  }
}

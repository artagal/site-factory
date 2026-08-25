import { isPartnerBillingConfigured } from "../../../../lib/stripe-billing";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { verifyApprovedPartnerBusiness } from "../../../../lib/server/partner-business-access";

export const runtime = "nodejs";

function clean(value: unknown, max = 140) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET(request: Request): Promise<Response> {
  const businessId = clean(new URL(request.url).searchParams.get("businessId"));
  if (!businessId) return jsonError("Choose a business before loading billing.", 400);

  const verified = await verifyApprovedPartnerBusiness(request, businessId);
  if ("error" in verified) return verified.error;

  const billingSnapshot = await verified.db.collection("businessBilling").doc(businessId).get();
  const billing = billingSnapshot.data() ?? {};

  return jsonOk({
    checkoutAvailable: isPartnerBillingConfigured(),
    paidAccessEnabled: verified.business.paidAccessEnabled === true,
    portalAvailable: typeof billing.stripeCustomerId === "string" && Boolean(billing.stripeCustomerId),
    pricingTier: verified.business.pricingTier === "growth" || verified.business.pricingTier === "pro"
      ? verified.business.pricingTier
      : "starter",
    subscriptionCancelAtPeriodEnd: billing.subscriptionCancelAtPeriodEnd === true,
    subscriptionCurrentPeriodEnd: billing.subscriptionCurrentPeriodEnd?.toDate?.()?.toISOString?.()
      ?? (typeof billing.subscriptionCurrentPeriodEnd === "string" ? billing.subscriptionCurrentPeriodEnd : null),
    subscriptionStatus: typeof billing.subscriptionStatus === "string"
      ? billing.subscriptionStatus
      : null
  });
}

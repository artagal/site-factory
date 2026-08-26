import { isPartnerBillingConfigured } from "../../../../lib/stripe-billing";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { verifyApprovedPartnerBusiness } from "../../../../lib/server/partner-business-access";
import { billingDate, billingRecord, resolvePartnerEntitlement } from "../../../../lib/partner-entitlements";

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
  const entitlement = resolvePartnerEntitlement(billing);
  const native = billingRecord(billing.nativeSubscription);

  return jsonOk({
    checkoutAvailable: isPartnerBillingConfigured() && entitlement.subscriptionProvider !== "app_store" && entitlement.subscriptionProvider !== "play_store",
    ...entitlement,
    portalAvailable: typeof billing.stripeCustomerId === "string" && Boolean(billing.stripeCustomerId),
    subscriptionCancelAtPeriodEnd: entitlement.subscriptionProvider === "app_store" || entitlement.subscriptionProvider === "play_store"
      ? native.cancelAtPeriodEnd === true : billing.subscriptionCancelAtPeriodEnd === true,
    stripeSubscriptionStatus: typeof billing.subscriptionStatus === "string"
      ? billing.subscriptionStatus
      : null,
    stripeSubscriptionCurrentPeriodEnd: billingDate(billing.subscriptionCurrentPeriodEnd)
  });
}

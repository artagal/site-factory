import { mobileId } from "../../../../lib/mobile-workspace";
import { NATIVE_PARTNER_PACKAGES, NATIVE_PARTNER_PRODUCTS, nativeBillingAvailable, nativePublicKey } from "../../../../lib/native-billing";
import { billingRecord, resolvePartnerEntitlement } from "../../../../lib/partner-entitlements";
import { canStartPartnerCheckout, normalizePartnerSubscriptionStatus } from "../../../../lib/stripe-billing";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { MobileError, mobileActor, mobileBusiness } from "../../../../lib/server/mobile-workspace-access";
import { fetchNativeSubscriber, prepareNativeSubscription, syncNativeSubscription } from "../../../../lib/server/native-billing";
import { checkRateLimit } from "../../../../lib/server/rate-limit";

export const runtime = "nodejs";

function noStore(response: Response): Response {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function failure(error: unknown): Response {
  return noStore(error instanceof MobileError ? jsonError(error.message, error.status) : jsonError("Subscription verification is temporarily unavailable. Try again.", 503));
}

export async function GET(request: Request): Promise<Response> {
  try {
    const actor = await mobileActor(request);
    if (!checkRateLimit(`native-billing-read:${actor.token.uid}`, 60, 60_000).allowed) throw new MobileError("Please try again in a minute.", 429);
    const query = new URL(request.url).searchParams;
    const platform = query.get("platform");
    if (platform !== "ios" && platform !== "android") throw new MobileError("Subscriptions are available in the iOS and Android apps.");
    if (query.get("businessId") && !mobileId(query.get("businessId"))) throw new MobileError("Choose a valid business.");
    const business = await mobileBusiness(actor, mobileId(query.get("businessId")));
    const billing = (await actor.db.collection("businessBilling").doc(business.id).get()).data() ?? {};
    const account = (await actor.db.collection("nativeBillingAccounts").doc(actor.token.uid).get()).data();
    const entitlement = resolvePartnerEntitlement(billing);
    const stripeExists = !canStartPartnerCheckout(normalizePartnerSubscriptionStatus(billing.subscriptionStatus));
    const otherOwner = Boolean((billing.nativeOwnerUid && billing.nativeOwnerUid !== actor.token.uid)
      || (account && account.businessId !== business.id));
    const publicKey = nativeBillingAvailable() ? nativePublicKey(platform) : null;
    const native = billingRecord(billing.nativeSubscription);
    const wrongStore = entitlement.paidAccessEnabled && native.store && native.store !== (platform === "ios" ? "app_store" : "play_store");
    return noStore(jsonOk({
      ...entitlement, businessId: business.id, businessName: business.data.name ?? "Your business",
      available: Boolean(publicKey) && !stripeExists && !otherOwner && !wrongStore,
      publicSdkKey: publicKey ?? "", appUserId: actor.token.uid,
      offeringId: "partner_plans", packages: NATIVE_PARTNER_PACKAGES, products: NATIVE_PARTNER_PRODUCTS,
      message: stripeExists ? "Your subscription is managed on the website."
        : otherOwner ? "This subscription is managed by another business owner."
        : wrongStore ? "Manage your subscription in the store where you purchased it."
        : !publicKey ? "Mobile subscriptions are not available yet. Starter remains free." : "",
      cancelAtPeriodEnd: native.cancelAtPeriodEnd === true
    }));
  } catch (error) { return failure(error); }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const actor = await mobileActor(request);
    if (!checkRateLimit(`native-billing-write:${actor.token.uid}`, 12, 60_000).allowed) throw new MobileError("Please try again in a minute.", 429);
    const text = await request.text();
    if (text.length > 4096) throw new MobileError("Request is too large.", 413);
    let body: Record<string, unknown>;
    try { body = billingRecord(JSON.parse(text)); } catch { throw new MobileError("Invalid JSON."); }
    if (!mobileId(body.businessId) || (body.action !== "prepare" && body.action !== "sync")) throw new MobileError("Choose a business and a valid subscription action.");
    if (body.platform !== "ios" && body.platform !== "android") throw new MobileError("Choose a supported mobile store.");
    const business = await mobileBusiness(actor, mobileId(body.businessId));
    if (body.action === "prepare") {
      return noStore(jsonOk({ businessId: business.id, ...await prepareNativeSubscription(actor, business.id, body.platform) }));
    }
    const account = (await actor.db.collection("nativeBillingAccounts").doc(actor.token.uid).get()).data();
    if (account?.businessId !== business.id) throw new MobileError("Link your business before verifying a purchase.", 409);
    const result = await syncNativeSubscription(actor.db, actor.token.uid, await fetchNativeSubscriber(actor.token.uid));
    return noStore(jsonOk({ ...result, message: result.paidAccessEnabled ? "Your subscription is active." : "No active subscription was verified. Pending purchases appear after the store approves them." }));
  } catch (error) { return failure(error); }
}

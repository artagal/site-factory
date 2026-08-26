import { createHash, timingSafeEqual } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";
import { nativeBillingAvailable, nativePublicKey, nativeSandboxAllowed, nativeSubscriptionFromSubscriber, type NativeSubscription } from "../native-billing";
import { activePartnerTier, billingRecord, resolvePartnerEntitlement } from "../partner-entitlements";
import { canStartPartnerCheckout, normalizePartnerSubscriptionStatus } from "../stripe-billing";
import { FieldValue } from "./firebase-admin";
import { MobileError, type MobileActor } from "./mobile-workspace-access";

export function authorizedRevenueCatWebhook(header: string | null, secret: string | undefined): boolean {
  if (!header || !secret?.trim()) return false;
  const actual = Buffer.from(header);
  const expected = Buffer.from(`Bearer ${secret.trim()}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function fetchNativeSubscriber(uid: string): Promise<NativeSubscription> {
  if (!nativeBillingAvailable()) throw new MobileError("Mobile subscriptions are not available yet.", 503);
  const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(uid)}`, {
    headers: { Authorization: `Bearer ${process.env.REVENUECAT_SECRET_API_KEY!.trim()}`, Accept: "application/json" },
    signal: AbortSignal.timeout(12_000), cache: "no-store"
  });
  if (!response.ok) throw new MobileError("The store could not verify your subscription. Please try again.", 502);
  return nativeSubscriptionFromSubscriber(await response.json(), nativeSandboxAllowed(uid));
}

function checkOwner(data: Record<string, unknown> | undefined, uid: string): void {
  if (!data || !Array.isArray(data.ownerIds) || !data.ownerIds.includes(uid)
    || data.status !== "approved" || data.isDemo === true) throw new MobileError("An approved business linked to your account is required.", 403);
}

// One store account is bound to one business. A client cannot reuse its receipt
// to grant a second business paid access or subscribe on behalf of another owner.
export async function prepareNativeSubscription(actor: MobileActor, businessId: string, platform: "ios" | "android") {
  const { db, token } = actor;
  if (!nativeBillingAvailable() || !nativePublicKey(platform)) throw new MobileError("Mobile subscriptions are not available yet.", 503);
  return db.runTransaction(async (transaction) => {
    const businessRef = db.collection("businesses").doc(businessId);
    const accountRef = db.collection("nativeBillingAccounts").doc(token.uid);
    const billingRef = db.collection("businessBilling").doc(businessId);
    const business = (await transaction.get(businessRef)).data();
    const account = (await transaction.get(accountRef)).data();
    const billing = (await transaction.get(billingRef)).data() ?? {};
    checkOwner(business, token.uid);
    if (account && account.businessId !== businessId) throw new MobileError("This store account is already linked to another business. Contact support to change it.", 409);
    if (billing.nativeOwnerUid && billing.nativeOwnerUid !== token.uid) throw new MobileError("Another owner manages this business subscription.", 409);
    const native = billingRecord(billing.nativeSubscription);
    if (activePartnerTier({ ...native, paidAccessEnabled: true }) !== "starter"
      && native.store !== (platform === "ios" ? "app_store" : "play_store")) {
      throw new MobileError("Manage your subscription in the store where you purchased it.", 409);
    }
    if (!canStartPartnerCheckout(normalizePartnerSubscriptionStatus(billing.subscriptionStatus))) {
      throw new MobileError("This business already has a web subscription. Manage it on the website before starting a mobile subscription.", 409);
    }
    if (!account) transaction.create(accountRef, { businessId, createdAt: FieldValue.serverTimestamp() });
    transaction.set(billingRef, { nativeOwnerUid: token.uid }, { merge: true });
    return resolvePartnerEntitlement(billing);
  });
}

export async function syncNativeSubscription(db: Firestore, uid: string, snapshot: NativeSubscription) {
  return db.runTransaction(async (transaction) => {
    const account = (await transaction.get(db.collection("nativeBillingAccounts").doc(uid))).data();
    if (typeof account?.businessId !== "string") throw new MobileError("Link your approved business before restoring a subscription.", 409);
    const businessRef = db.collection("businesses").doc(account.businessId);
    const billingRef = db.collection("businessBilling").doc(account.businessId);
    const business = (await transaction.get(businessRef)).data();
    const billing = (await transaction.get(billingRef)).data() ?? {};
    // Revocations still apply to a suspended business or a removed owner.
    if (!business || billing.nativeOwnerUid !== uid) throw new MobileError("Subscription ownership could not be verified.", 409);
    const previous = billingRecord(billing.nativeSubscription);
    if (typeof previous.verifiedAtMillis === "number" && previous.verifiedAtMillis >= snapshot.verifiedAtMillis) {
      return { businessId: account.businessId, stale: true, ...resolvePartnerEntitlement(billing) };
    }
    const claimId = createHash("sha256").update(snapshot.subscriberIdentity).digest("hex");
    const claimRef = db.collection("nativeSubscriberClaims").doc(claimId);
    const claim = (await transaction.get(claimRef)).data();
    const isActive = activePartnerTier({ ...snapshot, paidAccessEnabled: true }) !== "starter";
    if (isActive && claim && (claim.businessId !== account.businessId || claim.uid !== uid)) {
      throw new MobileError("This purchase belongs to another business account. Contact support to restore access.", 409);
    }
    if (isActive) {
      checkOwner(business, uid);
      if (!claim) transaction.create(claimRef, { businessId: account.businessId, uid, createdAt: FieldValue.serverTimestamp() });
    }
    const { subscriberIdentity: _identity, ...facts } = snapshot;
    const entitlement = resolvePartnerEntitlement({ ...billing, nativeSubscription: facts });
    transaction.set(billingRef, { nativeSubscription: facts, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    transaction.update(businessRef, { ...entitlement, subscriptionUpdatedAt: FieldValue.serverTimestamp() });
    return { businessId: account.businessId, stale: false, ...entitlement };
  });
}

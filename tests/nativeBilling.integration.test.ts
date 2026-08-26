import type { DecodedIdToken } from "firebase-admin/auth";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { getFirebaseAdminDb } from "../apps/website/src/lib/server/firebase-admin";
import { prepareNativeSubscription, syncNativeSubscription } from "../apps/website/src/lib/server/native-billing";
import { POST as revenuecatWebhook } from "../apps/website/src/app/api/webhooks/revenuecat/route";
import { NATIVE_PARTNER_PRODUCTS, type NativeSubscription } from "../apps/website/src/lib/native-billing";

const emulated = process.env.FIRESTORE_EMULATOR_HOST ? describe : describe.skip;
emulated("Native subscription storage and ownership", () => {
  const businessId = "native-billing-business";
  const uid = "native-billing-owner";
  const actor = (userId = uid) => ({ db: getFirebaseAdminDb()!, token: { uid: userId } as DecodedIdToken, isAdmin: false });
  const snapshot = (offset = 0): NativeSubscription => ({
    pricingTier: "growth", subscriptionStatus: "active", subscriptionCurrentPeriodEnd: new Date(Date.now() + 3_600_000).toISOString(),
    store: "app_store", productId: NATIVE_PARTNER_PRODUCTS.growth, sandbox: false, cancelAtPeriodEnd: false,
    verifiedAtMillis: Date.now() + offset, subscriberIdentity: uid
  });
  const configure = () => {
    vi.stubEnv("REVENUECAT_SECRET_API_KEY", "emulator-only");
    vi.stubEnv("REVENUECAT_WEBHOOK_AUTH", "emulator-only-webhook");
    vi.stubEnv("REVENUECAT_ALLOWED_APP_IDS", "app_emulator");
    vi.stubEnv("REVENUECAT_APP_STORE_PUBLIC_KEY", "appl_emulator");
    vi.stubEnv("REVENUECAT_PLAY_STORE_PUBLIC_KEY", "goog_emulator");
  };
  beforeAll(async () => {
    const project = process.env.GCLOUD_PROJECT ?? "demo-gofunmotion-native";
    if (!project.startsWith("demo-") && !project.endsWith("-test")) throw new Error("Emulator-only Firebase project required.");
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    delete process.env.FIREBASE_PRIVATE_KEY;
    process.env.FIREBASE_PROJECT_ID = project;
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = project;
    const db = getFirebaseAdminDb()!;
    await db.collection("businesses").doc(businessId).set({ name: "Emulator business", status: "approved", ownerIds: [uid, "second-owner"], isDemo: false });
    await db.collection("businesses").doc("other-native-business").set({ status: "approved", ownerIds: [uid], isDemo: false });
    await db.collection("businesses").doc("demo-native-business").set({ status: "approved", ownerIds: [uid], isDemo: true });
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it("binds an approved owned business and refuses other users, demos, and duplicate bindings", async () => {
    configure();
    await expect(prepareNativeSubscription(actor("stranger"), businessId, "ios")).rejects.toMatchObject({ status: 403 });
    await expect(prepareNativeSubscription(actor(), "demo-native-business", "ios")).rejects.toMatchObject({ status: 403 });
    expect(await prepareNativeSubscription(actor(), businessId, "ios")).toMatchObject({ paidAccessEnabled: false });
    await expect(prepareNativeSubscription(actor(), "other-native-business", "ios")).rejects.toMatchObject({ status: 409 });
    await expect(prepareNativeSubscription(actor("second-owner"), businessId, "ios")).rejects.toMatchObject({ status: 409 });
  });
  it("mirrors verified store access, ignores older responses, and rejects buying in another store", async () => {
    configure();
    const current = snapshot();
    expect(await syncNativeSubscription(getFirebaseAdminDb()!, uid, current)).toMatchObject({ pricingTier: "growth", subscriptionProvider: "app_store" });
    expect(await syncNativeSubscription(getFirebaseAdminDb()!, uid, { ...current, verifiedAtMillis: current.verifiedAtMillis - 100, pricingTier: "starter", subscriptionStatus: "canceled" }))
      .toMatchObject({ stale: true, pricingTier: "growth" });
    await expect(prepareNativeSubscription(actor(), businessId, "android")).rejects.toMatchObject({ status: 409 });
    expect((await getFirebaseAdminDb()!.collection("businesses").doc(businessId).get()).data())
      .toMatchObject({ pricingTier: "growth", paidAccessEnabled: true, subscriptionProvider: "app_store" });
  });
  it("does not grant one subscriber's purchase to a second account or business", async () => {
    const db = getFirebaseAdminDb()!;
    await db.collection("nativeBillingAccounts").doc("receipt-reuser").set({ businessId: "receipt-reuser-business" });
    await db.collection("businesses").doc("receipt-reuser-business").set({ status: "approved", ownerIds: ["receipt-reuser"] });
    await db.collection("businessBilling").doc("receipt-reuser-business").set({ nativeOwnerUid: "receipt-reuser" });
    await expect(syncNativeSubscription(db, "receipt-reuser", snapshot())).rejects.toMatchObject({ status: 409 });
  });
  it("keeps a valid Stripe plan when a mobile subscription expires", async () => {
    const db = getFirebaseAdminDb()!;
    await db.collection("businessBilling").doc(businessId).set({
      pricingTier: "pro", stripeSubscriptionId: "sub_emulator", subscriptionStatus: "active",
      subscriptionCurrentPeriodEnd: new Date(Date.now() + 3_600_000)
    }, { merge: true });
    expect(await syncNativeSubscription(db, uid, { ...snapshot(1), pricingTier: "starter", store: null, subscriptionStatus: "canceled", subscriptionCurrentPeriodEnd: null }))
      .toMatchObject({ pricingTier: "pro", paidAccessEnabled: true, subscriptionProvider: "stripe" });
    configure();
    await expect(prepareNativeSubscription(actor(), businessId, "ios")).rejects.toMatchObject({ status: 409 });
  });
  it("authenticates webhooks, re-reads store state, and processes a delivery only once", async () => {
    configure();
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      request_date_ms: Date.now(), subscriber: { original_app_user_id: uid, entitlements: {}, subscriptions: {} }
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const request = (appId = "app_emulator") => new Request("https://gofunmotion.test/api/webhooks/revenuecat", {
      method: "POST", headers: { authorization: "Bearer emulator-only-webhook" },
      body: JSON.stringify({ event: { id: "native-webhook-test", app_id: appId, type: "EXPIRATION", app_user_id: uid } })
    });
    expect((await revenuecatWebhook(request("other-app"))).status).toBe(403);
    expect(await (await revenuecatWebhook(request())).json()).toMatchObject({ synced: 1 });
    expect(await (await revenuecatWebhook(request())).json()).toMatchObject({ duplicate: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

import { describe, expect, it } from "vitest";
import { GET, POST } from "../apps/website/src/app/api/mobile/subscription/route";
import { POST as webhook } from "../apps/website/src/app/api/webhooks/revenuecat/route";
import { authorizedRevenueCatWebhook } from "../apps/website/src/lib/server/native-billing";
import { NATIVE_PARTNER_PRODUCTS, nativeBillingAvailable, nativePublicKey, nativeSandboxAllowed, nativeSubscriptionFromSubscriber } from "../apps/website/src/lib/native-billing";
import { activePartnerTier, billingDate, resolvePartnerEntitlement } from "../apps/website/src/lib/partner-entitlements";

const now = Date.parse("2026-08-26T12:00:00Z");
const end = "2026-09-26T12:00:00.000Z";
const product = NATIVE_PARTNER_PRODUCTS.growth;
function subscriber(overrides: Record<string, unknown> = {}) {
  return { request_date_ms: now, subscriber: {
    original_app_user_id: "owner-uid",
    entitlements: { growth: { product_identifier: product, expires_date: end } },
    subscriptions: { [product]: { expires_date: end, store: "app_store", is_sandbox: false, ownership_type: "PURCHASED", refunded_at: null, ...overrides } }
  } };
}

describe("Store-backed partner subscriptions", () => {
  it("grants only a matching, purchased, unexpired store entitlement", () => {
    expect(nativeSubscriptionFromSubscriber(subscriber(), false, now)).toMatchObject({ pricingTier: "growth", store: "app_store", subscriptionCurrentPeriodEnd: end });
    for (const patch of [{ expires_date: "2026-07-01T00:00:00Z" }, { expires_date: null }, { store: "promotional" },
      { ownership_type: "FAMILY_SHARED" }, { is_sandbox: true }, { refunded_at: "2026-08-26T10:00:00Z" }]) {
      expect(nativeSubscriptionFromSubscriber(subscriber(patch), false, now).pricingTier).toBe("starter");
    }
  });
  it("keeps cancelled renewal access until expiry, and rejects mismatched product IDs", () => {
    expect(nativeSubscriptionFromSubscriber(subscriber({ unsubscribe_detected_at: "2026-08-26T10:00:00Z" }), false, now))
      .toMatchObject({ pricingTier: "growth", cancelAtPeriodEnd: true });
    const response = subscriber();
    response.subscriber.entitlements.growth.product_identifier = NATIVE_PARTNER_PRODUCTS.pro as typeof product;
    expect(nativeSubscriptionFromSubscriber(response, false, now).pricingTier).toBe("starter");
  });
  it("requires explicit sandbox tester allowlisting", () => {
    const environment: NodeJS.ProcessEnv = { NODE_ENV: "test", REVENUECAT_SANDBOX_TEST_UIDS: "owner-uid, second-owner" };
    expect(nativeSandboxAllowed("owner-uid", environment)).toBe(true);
    expect(nativeSandboxAllowed("stranger", environment)).toBe(false);
    expect(nativeSubscriptionFromSubscriber(subscriber({ is_sandbox: true }), true, now).pricingTier).toBe("growth");
  });
  it("rejects malformed and stale verification responses", () => {
    expect(() => nativeSubscriptionFromSubscriber({}, false, now)).toThrow();
    expect(() => nativeSubscriptionFromSubscriber({ ...subscriber(), request_date_ms: now - 301_000 }, false, now)).toThrow();
    expect(() => nativeSubscriptionFromSubscriber({ ...subscriber(), request_date_ms: now + 61_000 }, false, now)).toThrow();
  });
  it("requires complete configuration and never returns a server secret as SDK key", () => {
    expect(nativeBillingAvailable({ NODE_ENV: "test", REVENUECAT_SECRET_API_KEY: "server-only" })).toBe(false);
    expect(nativePublicKey("ios", { NODE_ENV: "test", REVENUECAT_APP_STORE_PUBLIC_KEY: "sk_private" })).toBeNull();
    expect(nativePublicKey("android", { NODE_ENV: "test", REVENUECAT_PLAY_STORE_PUBLIC_KEY: "goog_public" })).toBe("goog_public");
  });
  it("requires exact authenticated webhook headers", () => {
    expect(authorizedRevenueCatWebhook("Bearer private-test-token", "private-test-token")).toBe(true);
    expect(authorizedRevenueCatWebhook("Bearer private-test-token-extra", "private-test-token")).toBe(false);
    expect(authorizedRevenueCatWebhook(null, "private-test-token")).toBe(false);
  });
  it("protects reads, writes and webhooks without trusting client entitlement claims", async () => {
    expect((await GET(new Request("https://gofunmotion.test/api/mobile/subscription?platform=ios"))).status).toBe(401);
    const result = await POST(new Request("https://gofunmotion.test/api/mobile/subscription", { method: "POST", body: JSON.stringify({ pricingTier: "pro", paidAccessEnabled: true }) }));
    expect(result.status).toBe(401);
    expect(result.headers.get("cache-control")).toContain("no-store");
    expect((await webhook(new Request("https://gofunmotion.test/api/webhooks/revenuecat", { method: "POST", body: "{}" }))).status).toBe(401);
  });
});

describe("Shared billing entitlement projection", () => {
  const stripe = { pricingTier: "pro", subscriptionStatus: "active", subscriptionCurrentPeriodEnd: end };
  const native = { pricingTier: "growth", subscriptionStatus: "active", subscriptionCurrentPeriodEnd: end, store: "app_store" };
  it("does not let an expired or cancelled provider override another active provider", () => {
    expect(resolvePartnerEntitlement({ ...stripe, nativeSubscription: native }, now)).toMatchObject({ pricingTier: "pro", subscriptionProvider: "stripe" });
    expect(resolvePartnerEntitlement({ ...stripe, subscriptionStatus: "canceled", nativeSubscription: native }, now))
      .toMatchObject({ pricingTier: "growth", subscriptionProvider: "app_store" });
    expect(resolvePartnerEntitlement({ ...stripe, subscriptionCurrentPeriodEnd: "2020-01-01", nativeSubscription: { ...native, subscriptionStatus: "canceled" } }, now))
      .toMatchObject({ pricingTier: "starter", paidAccessEnabled: false });
  });
  it("normalizes timestamps and fails closed without a future expiry", () => {
    expect(billingDate({ toDate: () => new Date(end) })).toBe("2026-09-26T12:00:00.000Z");
    expect(billingDate("invalid")).toBeNull();
    expect(activePartnerTier({ pricingTier: "pro", paidAccessEnabled: true, subscriptionStatus: "active" }, now)).toBe("starter");
  });
});

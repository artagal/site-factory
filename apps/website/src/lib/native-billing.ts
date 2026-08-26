import { billingDate, billingRecord, type PaidTier } from "./partner-entitlements";

export const NATIVE_PARTNER_PRODUCTS = {
  growth: "com.gofunmotion.app.growth.monthly",
  pro: "com.gofunmotion.app.pro.monthly"
} as const;
export const NATIVE_PARTNER_PACKAGES = { growth: "growth_monthly", pro: "pro_monthly" } as const;

export type NativeSubscription = {
  pricingTier: "starter" | PaidTier;
  subscriptionStatus: "active" | "trialing" | "canceled";
  subscriptionCurrentPeriodEnd: string | null;
  store: "app_store" | "play_store" | null;
  productId: string | null;
  sandbox: boolean;
  cancelAtPeriodEnd: boolean;
  verifiedAtMillis: number;
  subscriberIdentity: string;
};

export function nativeSubscriptionFromSubscriber(payload: unknown, allowSandbox = false, now = Date.now()): NativeSubscription {
  const response = billingRecord(payload);
  const subscriber = billingRecord(response.subscriber);
  const verifiedAt = response.request_date_ms;
  if (typeof verifiedAt !== "number" || !Number.isFinite(verifiedAt)
    || verifiedAt > now + 60_000 || verifiedAt < now - 300_000
    || typeof subscriber.original_app_user_id !== "string" || !subscriber.original_app_user_id
    || !subscriber.entitlements || !subscriber.subscriptions) {
    throw new Error("Invalid or stale store verification response.");
  }
  const entitlements = billingRecord(subscriber.entitlements);
  const subscriptions = billingRecord(subscriber.subscriptions);
  for (const tier of ["pro", "growth"] as const) {
    const entitlement = billingRecord(entitlements[tier]);
    const productId = entitlement.product_identifier;
    if (typeof productId !== "string" || (productId !== NATIVE_PARTNER_PRODUCTS[tier] && productId !== `${NATIVE_PARTNER_PRODUCTS[tier]}:monthly`)) continue;
    const subscription = billingRecord(subscriptions[productId]);
    const store = subscription.store;
    const end = billingDate(subscription.expires_date);
    const entitlementEnd = billingDate(entitlement.expires_date);
    if ((store !== "app_store" && store !== "play_store") || !end || !entitlementEnd
      || Date.parse(end) <= now || Date.parse(entitlementEnd) <= now
      || subscription.refunded_at != null || subscription.ownership_type !== "PURCHASED"
      || typeof subscription.is_sandbox !== "boolean" || (subscription.is_sandbox && !allowSandbox)) continue;
    return {
      pricingTier: tier,
      subscriptionStatus: subscription.period_type === "trial" ? "trialing" : "active",
      subscriptionCurrentPeriodEnd: new Date(Math.min(Date.parse(end), Date.parse(entitlementEnd))).toISOString(),
      store,
      productId,
      sandbox: subscription.is_sandbox,
      cancelAtPeriodEnd: subscription.unsubscribe_detected_at != null,
      verifiedAtMillis: verifiedAt,
      subscriberIdentity: subscriber.original_app_user_id
    };
  }
  return {
    pricingTier: "starter", subscriptionStatus: "canceled", subscriptionCurrentPeriodEnd: null,
    store: null, productId: null, sandbox: false, cancelAtPeriodEnd: false,
    verifiedAtMillis: verifiedAt, subscriberIdentity: subscriber.original_app_user_id
  };
}

export function nativeSandboxAllowed(uid: string, environment: NodeJS.ProcessEnv = process.env): boolean {
  return (environment.REVENUECAT_SANDBOX_TEST_UIDS ?? "").split(",").map((id) => id.trim()).filter(Boolean).includes(uid);
}

export function nativeBillingAvailable(environment: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(environment.REVENUECAT_SECRET_API_KEY?.trim()
    && environment.REVENUECAT_WEBHOOK_AUTH?.trim()
    && environment.REVENUECAT_ALLOWED_APP_IDS?.trim()
    && (environment.REVENUECAT_APP_STORE_PUBLIC_KEY?.trim() || environment.REVENUECAT_PLAY_STORE_PUBLIC_KEY?.trim()));
}

export function nativePublicKey(platform: "ios" | "android", environment: NodeJS.ProcessEnv = process.env): string | null {
  const value = (platform === "ios" ? environment.REVENUECAT_APP_STORE_PUBLIC_KEY : environment.REVENUECAT_PLAY_STORE_PUBLIC_KEY)?.trim();
  return value?.startsWith(platform === "ios" ? "appl_" : "goog_") ? value : null;
}

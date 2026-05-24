import type Stripe from "stripe";
import { type PaidPartnerPricingTier } from "../payments";
import { FieldValue, getFirebaseAdminDb } from "./firebase-admin";

type StripeObjectRef = string | { id?: string } | null | undefined;

type PartnerSubscriptionSyncResult = {
  businessId?: string;
  status: "business_updated" | "ignored" | "pending_business_link";
  subscriptionId?: string;
};

const paidAccessStatuses = new Set(["active", "trialing"]);
const paidTiers = new Set<PaidPartnerPricingTier>(["growth", "pro"]);

function asId(value: StripeObjectRef) {
  if (!value) return null;
  if (typeof value === "string") return value;
  return typeof value.id === "string" ? value.id : null;
}

function normalizeTier(value: unknown): PaidPartnerPricingTier | null {
  return typeof value === "string" && paidTiers.has(value as PaidPartnerPricingTier)
    ? (value as PaidPartnerPricingTier)
    : null;
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription | null) {
  const seconds = subscription ? (subscription as { current_period_end?: unknown }).current_period_end : null;
  return typeof seconds === "number" ? new Date(seconds * 1000) : null;
}

async function readExistingSubscription(subscriptionId: string) {
  const db = getFirebaseAdminDb();
  if (!db) return null;

  const snapshot = await db.collection("partnerSubscriptions").doc(subscriptionId).get();
  return snapshot.exists ? snapshot.data() ?? null : null;
}

async function writeSubscriptionRecord({
  businessId,
  customerEmail,
  customerId,
  sessionId,
  status,
  subscription,
  subscriptionId,
  tier
}: {
  businessId: string | null;
  customerEmail: string | null;
  customerId: string | null;
  sessionId?: string;
  status: string | null;
  subscription: Stripe.Subscription | null;
  subscriptionId: string;
  tier: PaidPartnerPricingTier | null;
}) {
  const db = getFirebaseAdminDb();
  if (!db) throw new Error("Firebase Admin is not configured.");

  await db.collection("partnerSubscriptions").doc(subscriptionId).set(
    {
      businessId,
      customerEmail,
      lastStripeSessionId: sessionId ?? null,
      paidAccessEnabled: status ? paidAccessStatuses.has(status) : false,
      pricingTier: tier,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionCurrentPeriodEnd: getCurrentPeriodEnd(subscription),
      subscriptionStatus: status ?? "unknown",
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

async function updateBusinessSubscription({
  businessId,
  customerId,
  status,
  subscription,
  subscriptionId,
  tier
}: {
  businessId: string;
  customerId: string | null;
  status: string | null;
  subscription: Stripe.Subscription | null;
  subscriptionId: string;
  tier: PaidPartnerPricingTier;
}) {
  const db = getFirebaseAdminDb();
  if (!db) throw new Error("Firebase Admin is not configured.");

  await db.collection("businesses").doc(businessId).set(
    {
      paidAccessEnabled: status ? paidAccessStatuses.has(status) : false,
      pricingTier: status === "canceled" ? "starter" : tier,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionCurrentPeriodEnd: getCurrentPeriodEnd(subscription),
      subscriptionStatus: status ?? "unknown",
      subscriptionUpdatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

export async function syncPartnerCheckoutSession(
  session: Stripe.Checkout.Session,
  stripe: Stripe
): Promise<PartnerSubscriptionSyncResult> {
  if (session.mode !== "subscription" || session.metadata?.product !== "partner_subscription") {
    return { status: "ignored" };
  }

  const subscriptionId = asId(session.subscription);
  if (!subscriptionId) return { status: "ignored" };

  const tier = normalizeTier(session.metadata?.tier);
  const businessId = typeof session.metadata?.businessId === "string" && session.metadata.businessId.trim()
    ? session.metadata.businessId.trim()
    : null;
  const customerId = asId(session.customer);
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const status = subscription.status ?? null;

  await writeSubscriptionRecord({
    businessId,
    customerEmail,
    customerId,
    sessionId: session.id,
    status,
    subscription,
    subscriptionId,
    tier
  });

  if (!businessId || !tier) {
    return { status: "pending_business_link", subscriptionId };
  }

  await updateBusinessSubscription({
    businessId,
    customerId,
    status,
    subscription,
    subscriptionId,
    tier
  });

  return { businessId, status: "business_updated", subscriptionId };
}

export async function syncPartnerSubscriptionEvent(
  subscription: Stripe.Subscription
): Promise<PartnerSubscriptionSyncResult> {
  const subscriptionId = subscription.id;
  const existing = await readExistingSubscription(subscriptionId);
  const businessId = typeof subscription.metadata?.businessId === "string" && subscription.metadata.businessId.trim()
    ? subscription.metadata.businessId.trim()
    : typeof existing?.businessId === "string" && existing.businessId.trim()
      ? existing.businessId.trim()
      : null;
  const tier = normalizeTier(subscription.metadata?.tier) ?? normalizeTier(existing?.pricingTier);
  const customerId = asId(subscription.customer);
  const status = subscription.status ?? null;

  await writeSubscriptionRecord({
    businessId,
    customerEmail: typeof existing?.customerEmail === "string" ? existing.customerEmail : null,
    customerId,
    status,
    subscription,
    subscriptionId,
    tier
  });

  if (!businessId || !tier) {
    return { status: "pending_business_link", subscriptionId };
  }

  await updateBusinessSubscription({
    businessId,
    customerId,
    status,
    subscription,
    subscriptionId,
    tier
  });

  return { businessId, status: "business_updated", subscriptionId };
}

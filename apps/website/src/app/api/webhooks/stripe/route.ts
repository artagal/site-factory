import type Stripe from "stripe";
import type { Firestore } from "firebase-admin/firestore";
import {
  hasPaidPartnerAccess,
  normalizePartnerSubscriptionStatus,
  partnerTierForStripePriceId
} from "../../../../lib/stripe-billing";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb } from "../../../../lib/server/firebase-admin";
import { getStripeClient, getStripeWebhookSecret } from "../../../../lib/server/stripe";

export const runtime = "nodejs";

function stripeObjectId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null;
}

function subscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const periodEnds = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return periodEnds.length ? new Date(Math.max(...periodEnds) * 1000) : null;
}

function timestampMillis(value: unknown) {
  if (value instanceof Date) return value.getTime();
  if (!value || typeof value !== "object") return null;

  const timestamp = value as { toDate?: () => Date; toMillis?: () => number };
  if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
  if (typeof timestamp.toDate === "function") return timestamp.toDate().getTime();
  return null;
}

async function findBusinessId(
  db: Firestore,
  subscription: Stripe.Subscription,
  hintedBusinessId?: string | null
) {
  if (hintedBusinessId) {
    const hinted = await db.collection("businesses").doc(hintedBusinessId).get();
    if (hinted.exists) return hintedBusinessId;
  }

  const subscriptionMatch = await db.collection("businessBilling")
    .where("stripeSubscriptionId", "==", subscription.id)
    .limit(1)
    .get();
  if (!subscriptionMatch.empty) return subscriptionMatch.docs[0].id;

  const customerId = stripeObjectId(subscription.customer);
  if (!customerId) return null;
  const customerMatch = await db.collection("businessBilling")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();
  return customerMatch.empty ? null : customerMatch.docs[0].id;
}

async function syncSubscription(
  event: Stripe.Event,
  subscription: Stripe.Subscription,
  hintedBusinessId?: string | null
) {
  const db = getFirebaseAdminDb();
  if (!db) throw new Error("Firebase Admin is not configured.");

  const priceId = subscription.items.data[0]?.price.id ?? null;
  const tier = partnerTierForStripePriceId(priceId);
  if (!tier) return { ignored: "unknown_price" };

  const businessId = await findBusinessId(
    db,
    subscription,
    hintedBusinessId || subscription.metadata.gofunmotionBusinessId
  );
  if (!businessId) return { ignored: "business_not_found" };

  const customerId = stripeObjectId(subscription.customer);
  const subscriptionStatus = normalizePartnerSubscriptionStatus(subscription.status);
  const paidAccessEnabled = hasPaidPartnerAccess(subscriptionStatus);
  const eventRef = db.collection("stripeWebhookEvents").doc(event.id);
  const businessRef = db.collection("businesses").doc(businessId);
  const billingRef = db.collection("businessBilling").doc(businessId);
  const eventCreatedAt = new Date(event.created * 1000);

  const processingResult = await db.runTransaction(async (transaction) => {
    const existingEvent = await transaction.get(eventRef);
    if (existingEvent.exists) return "duplicate" as const;

    const billingSnapshot = await transaction.get(billingRef);
    const lastEventMillis = timestampMillis(billingSnapshot.data()?.lastStripeEventCreatedAt);
    if (lastEventMillis !== null && lastEventMillis > eventCreatedAt.getTime()) {
      transaction.create(eventRef, {
        businessId,
        createdAt: FieldValue.serverTimestamp(),
        eventCreatedAt,
        eventType: event.type,
        ignoredReason: "stale_event",
        stripeObjectId: subscription.id
      });
      return "stale" as const;
    }

    transaction.set(
      businessRef,
      {
        paidAccessEnabled,
        pricingTier: tier,
        subscriptionUpdatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    transaction.set(
      billingRef,
      {
        lastStripeEventId: event.id,
        lastStripeEventCreatedAt: eventCreatedAt,
        pricingTier: tier,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end,
        subscriptionCurrentPeriodEnd: subscriptionPeriodEnd(subscription),
        subscriptionStatus: subscriptionStatus ?? String(subscription.status),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    transaction.create(eventRef, {
      businessId,
      createdAt: FieldValue.serverTimestamp(),
      eventCreatedAt,
      eventType: event.type,
      stripeObjectId: subscription.id
    });
    return "processed" as const;
  });

  return {
    businessId,
    duplicate: processingResult === "duplicate",
    paidAccessEnabled,
    stale: processingResult === "stale",
    tier
  };
}

export async function POST(request: Request): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return jsonError("Missing Stripe signature.", 400);

  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();
  if (!stripe || !webhookSecret) return jsonError("Stripe webhook is not configured.", 503);

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return jsonError("Invalid Stripe signature.", 400);
  }

  try {
    if (
      event.type === "customer.subscription.created"
      || event.type === "customer.subscription.updated"
      || event.type === "customer.subscription.deleted"
    ) {
      return jsonOk({ result: await syncSubscription(event, event.data.object) });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const subscriptionId = stripeObjectId(session.subscription);
      if (!subscriptionId) return jsonOk({ ignored: "checkout_without_subscription" });
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return jsonOk({
        result: await syncSubscription(
          event,
          subscription,
          session.client_reference_id || session.metadata?.gofunmotionBusinessId
        )
      });
    }

    return jsonOk({ ignored: "unsupported_event" });
  } catch (error) {
    console.error("stripe_webhook_processing_failed", {
      eventId: event.id,
      eventType: event.type,
      error: error instanceof Error ? error.message : "unknown"
    });
    return jsonError("Stripe event could not be processed.", 500);
  }
}

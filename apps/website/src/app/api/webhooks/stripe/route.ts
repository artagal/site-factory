import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { syncPartnerCheckoutSession, syncPartnerSubscriptionEvent } from "../../../../lib/server/partner-subscriptions";
import { getStripeClient, getStripeWebhookSecret } from "../../../../lib/server/stripe";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return jsonError("Stripe webhooks are not configured.", 503);
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return jsonError("Missing Stripe signature.", 400);

  const payload = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    let syncResult: Record<string, unknown> = { status: "ignored" };

    if (event.type === "checkout.session.completed") {
      syncResult = await syncPartnerCheckoutSession(event.data.object, stripe);
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      syncResult = await syncPartnerSubscriptionEvent(event.data.object);
    }

    return jsonOk({
      received: true,
      sync: syncResult,
      type: event.type
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook signature.";
    const status = message.includes("Firebase Admin is not configured") ? 503 : 400;
    return jsonError(message, status);
  }
}

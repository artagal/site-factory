import { jsonError, jsonOk } from "../../../../lib/server/api-response";
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

    return jsonOk({
      received: true,
      type: event.type
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid Stripe webhook signature.", 400);
  }
}

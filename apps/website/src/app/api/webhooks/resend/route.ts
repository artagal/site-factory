import { Webhook } from "svix";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb } from "../../../../lib/server/firebase-admin";

type ResendEvent = {
  created_at?: string;
  data?: {
    email_id?: string;
    tags?: Record<string, string>;
    to?: string[];
  };
  type?: string;
};

function clean(value: unknown, max = 240) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function deliveryStatus(type: string) {
  if (type === "email.delivered") return "delivered";
  if (type === "email.bounced") return "bounced";
  if (type === "email.complained") return "complained";
  if (type === "email.failed") return "failed";
  if (type === "email.delivery_delayed") return "delayed";
  if (type === "email.sent") return "sent";
  if (type === "email.opened") return "opened";
  if (type === "email.clicked") return "clicked";
  return "received";
}

export async function POST(request: Request): Promise<Response> {
  const webhookSecret = clean(process.env.RESEND_WEBHOOK_SECRET, 300);
  if (!webhookSecret) return jsonError("Email delivery verification is not configured.", 503);

  const id = clean(request.headers.get("svix-id"), 200);
  const timestamp = clean(request.headers.get("svix-timestamp"), 80);
  const signature = clean(request.headers.get("svix-signature"), 800);
  if (!id || !timestamp || !signature) return jsonError("Missing webhook signature headers.", 400);

  const payload = await request.text();
  let event: ResendEvent;
  try {
    event = new Webhook(webhookSecret).verify(payload, {
      "svix-id": id,
      "svix-signature": signature,
      "svix-timestamp": timestamp
    }) as ResendEvent;
  } catch {
    return jsonError("Invalid webhook signature.", 400);
  }

  const type = clean(event.type, 80);
  const emailId = clean(event.data?.email_id, 180);
  if (!type.startsWith("email.") || !emailId) return jsonError("Unsupported email event.", 400);

  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Email delivery storage is not connected yet.", 503);

  const tags = Object.fromEntries(Object.entries(event.data?.tags ?? {}).slice(0, 12).map(([key, value]) => [
    clean(key.replace(/[^a-zA-Z0-9_-]/g, "_"), 100),
    clean(value, 240)
  ]));
  const eventRef = db.collection("emailDeliveryEvents").doc(id);
  const providerCreatedAt = clean(event.created_at, 80) || null;

  try {
    await eventRef.create({
      createdAt: FieldValue.serverTimestamp(),
      emailId,
      providerCreatedAt,
      recipientCount: Array.isArray(event.data?.to) ? event.data.to.length : 0,
      status: deliveryStatus(type),
      tags,
      type
    });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "6" || code.toLowerCase().includes("already-exists")) {
      return jsonOk({ duplicate: true, received: true });
    }
    throw error;
  }

  const bookingRequestId = clean(tags.booking_request_id, 180);
  const category = clean(tags.category, 100).replace(/[^a-zA-Z0-9_-]/g, "_");
  if (bookingRequestId && category) {
    const bookingRef = db.collection("bookingRequests").doc(bookingRequestId);
    await db.runTransaction(async (transaction) => {
      const bookingSnapshot = await transaction.get(bookingRef);
      if (!bookingSnapshot.exists) return;

      const delivery = bookingSnapshot.data()?.emailDelivery as Record<string, unknown> | undefined;
      const previous = delivery?.[category] as Record<string, unknown> | undefined;
      const previousCreatedAt = clean(previous?.providerCreatedAt, 80);
      const previousTime = Date.parse(previousCreatedAt);
      const nextTime = Date.parse(providerCreatedAt ?? "");
      if (Number.isFinite(previousTime) && (!Number.isFinite(nextTime) || previousTime > nextTime)) return;

      transaction.update(bookingRef, {
        [`emailDelivery.${category}`]: {
          emailId,
          providerCreatedAt,
          status: deliveryStatus(type),
          type,
          updatedAt: FieldValue.serverTimestamp()
        }
      });
    });
  }

  return jsonOk({ received: true, status: deliveryStatus(type) });
}

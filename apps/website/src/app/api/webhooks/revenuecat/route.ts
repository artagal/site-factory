import { mobileId } from "../../../../lib/mobile-workspace";
import { billingRecord } from "../../../../lib/partner-entitlements";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb } from "../../../../lib/server/firebase-admin";
import { authorizedRevenueCatWebhook, fetchNativeSubscriber, syncNativeSubscription } from "../../../../lib/server/native-billing";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (!authorizedRevenueCatWebhook(request.headers.get("authorization"), process.env.REVENUECAT_WEBHOOK_AUTH)) {
    return jsonError("Invalid webhook authorization.", 401);
  }
  try {
    const text = await request.text();
    if (text.length > 65_536) return jsonError("Payload is too large.", 413);
    let payload: Record<string, unknown>;
    try { payload = billingRecord(JSON.parse(text)); } catch { return jsonError("Invalid JSON.", 400); }
    const event = billingRecord(payload.event);
    const id = mobileId(event.id);
    if (!id || typeof event.type !== "string") return jsonError("Invalid webhook event.", 400);
    if (event.type === "TEST") return jsonOk({ test: true });
    const allowedApps = (process.env.REVENUECAT_ALLOWED_APP_IDS ?? "").split(",").map((app) => app.trim()).filter(Boolean);
    if (typeof event.app_id !== "string" || !allowedApps.includes(event.app_id)) return jsonError("Unexpected application.", 403);
    const db = getFirebaseAdminDb();
    if (!db) return jsonError("Subscription storage is unavailable.", 503);
    const eventRef = db.collection("revenuecatWebhookEvents").doc(id);
    if ((await eventRef.get()).exists) return jsonOk({ duplicate: true });
    const rawUsers: unknown[] = event.type === "TRANSFER"
      ? [...(Array.isArray(event.transferred_from) ? event.transferred_from : []), ...(Array.isArray(event.transferred_to) ? event.transferred_to : [])]
      : [event.app_user_id];
    const users = [...new Set(rawUsers.map(mobileId).filter((uid) => uid && !uid.startsWith("$RCAnonymousID:")))];
    if (users.length > 20) return jsonError("Too many transfer accounts.", 400);
    let synced = 0;
    for (const uid of users) {
      if (!(await db.collection("nativeBillingAccounts").doc(uid).get()).exists) continue;
      // Query current provider state, not the potentially delayed webhook body.
      await syncNativeSubscription(db, uid, await fetchNativeSubscriber(uid));
      synced++;
    }
    await db.runTransaction(async (transaction) => {
      if (!(await transaction.get(eventRef)).exists) transaction.create(eventRef, {
        eventType: event.type, syncedAccounts: synced, processedAt: FieldValue.serverTimestamp()
      });
    });
    return jsonOk({ synced });
  } catch {
    return jsonError("Subscription event could not be verified. Retry delivery.", 503);
  }
}

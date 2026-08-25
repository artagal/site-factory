import { jsonError, jsonOk } from "../../../../../lib/server/api-response";
import { sendBookingStatusNotification } from "../../../../../lib/server/email";
import { FieldValue, getFirebaseAdminDb, verifyBearerToken } from "../../../../../lib/server/firebase-admin";
import { sendPushToUsers } from "../../../../../lib/server/push";

const STATUSES = ["contacted", "confirmed", "cancelled", "rejected"] as const;
type BookingStatusUpdate = typeof STATUSES[number];
const statusSet = new Set<string>(STATUSES);

function clean(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const requestId = clean(body?.requestId, 160);
  const status = clean(body?.status, 40);

  if (!requestId || !statusSet.has(status)) {
    return jsonError("Add requestId and a valid booking status.", 400);
  }

  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Live request updates are not connected yet.", 503);

  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in as a business owner before updating requests.", 401);

  const requestRef = db.collection("bookingRequests").doc(requestId);
  const requestSnapshot = await requestRef.get();
  if (!requestSnapshot.exists) return jsonError("Booking request was not found.", 404);

  const requestData = requestSnapshot.data() ?? {};
  const ownerIds = Array.isArray(requestData.businessOwnerIds) ? requestData.businessOwnerIds.map(String) : [];
  const businessId = typeof requestData.businessId === "string" ? requestData.businessId : "";
  const isListedOwner = ownerIds.includes(token.uid);

  let isBusinessOwner = false;
  if (!isListedOwner && businessId) {
    const businessSnapshot = await db.collection("businesses").doc(businessId).get();
    const business = businessSnapshot.data() ?? {};
    const businessOwnerIds = Array.isArray(business.ownerIds) ? business.ownerIds.map(String) : [];
    isBusinessOwner = businessOwnerIds.includes(token.uid);
  }

  if (!isListedOwner && !isBusinessOwner) {
    return jsonError("Only the owning business can update this booking request.", 403);
  }

  const nextStatus = status as BookingStatusUpdate;

  await requestRef.set(
    {
      lastStatusChangedAt: FieldValue.serverTimestamp(),
      lastStatusChangedBy: token.uid,
      status: nextStatus,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  const notificationPayload = {
      businessName: typeof requestData.businessName === "string" ? requestData.businessName : "Local business",
      email: typeof requestData.email === "string" ? requestData.email : "",
      listingId: typeof requestData.listingId === "string" ? requestData.listingId : "",
      listingTitle: typeof requestData.listingTitle === "string" ? requestData.listingTitle : "Requested activity",
      message: typeof requestData.message === "string" ? requestData.message : "",
      name: typeof requestData.name === "string" ? requestData.name : "Customer",
      partySize: typeof requestData.partySize === "number" ? requestData.partySize : 1,
      phone: typeof requestData.phone === "string" ? requestData.phone : null,
      requestedDate: typeof requestData.requestedDate === "string" ? requestData.requestedDate : "",
      requestedTime: typeof requestData.requestedTime === "string" ? requestData.requestedTime : ""
  };
  const [notification, push] = await Promise.all([
    sendBookingStatusNotification({
      request: notificationPayload,
      requestId,
      status: nextStatus
    }).catch((error) => ({
      configured: false,
      results: [{ attempted: true, error: error instanceof Error ? error.message : "Could not send notification.", ok: false, provider: "resend" as const, to: [] }],
      status: "partial"
    })),
    sendPushToUsers({
      body: `${notificationPayload.businessName} marked your request ${nextStatus}.`,
      data: { bookingRequestId: requestId, link: "/profile", status: nextStatus, type: "booking_status_changed" },
      notificationId: `booking-status-${nextStatus}-${requestId}`,
      title: `Request ${nextStatus}`,
      userIds: typeof requestData.userId === "string" ? [requestData.userId] : []
    }).catch(() => ({ attempted: 0, failed: 0, inAppCreated: 0, sent: 0, status: "skipped" as const }))
  ]);

  await requestRef.set(
    {
      lastStatusNotificationResults: notification.results,
      lastStatusNotificationStatus: notification.status,
      lastStatusNotificationUpdatedAt: FieldValue.serverTimestamp(),
      lastStatusPushResult: push
    },
    { merge: true }
  );

  return jsonOk({ notificationStatus: notification.status, pushStatus: push.status, requestId, status: nextStatus });
}

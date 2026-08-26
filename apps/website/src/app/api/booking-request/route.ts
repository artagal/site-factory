import { jsonError, jsonOk } from "../../../lib/server/api-response";
import { isOpenListing } from "../../../lib/listing-presentation";
import { FieldValue, getFirebaseAdminDb, verifyBearerToken } from "../../../lib/server/firebase-admin";
import { getClientIp, checkRateLimit } from "../../../lib/server/rate-limit";
import { getPublicListingByIdOrSlugForServer } from "../../../lib/server/public-listings";
import { incrementServerGlobalStats } from "../../../lib/server/stats";
import { sendBookingRequestNotifications } from "../../../lib/server/email";
import { sendPushToUsers } from "../../../lib/server/push";

function clean(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isValidRequestedSlot(dateValue: string, timeValue: string) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeValue);
  if (!dateMatch || !timeMatch) return false;
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  return !Number.isNaN(date.getTime())
    && date.toISOString().slice(0, 10) === dateValue
    && hour >= 0
    && hour <= 23
    && minute >= 0
    && minute <= 59;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`booking:${ip}`, 10, 60 * 60_000);
  if (!limit.allowed) return jsonError("Too many booking requests. Try again later.", 429);

  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in to request booking.", 401);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const listingSlug = clean(body?.listingSlug, 120);
  const listingId = clean(body?.listingId, 120);
  if (!listingId && !listingSlug) return jsonError("Choose a deal before requesting booking.", 400);

  const name = clean(body?.name, 120);
  const email = clean(body?.email, 254).toLowerCase();
  const phone = clean(body?.phone, 40) || null;
  const requestedDate = clean(body?.requestedDate, 40);
  const requestedTime = clean(body?.requestedTime, 40);
  const message = clean(body?.message, 600);
  const partySize = Number(body?.partySize ?? 0);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !isValidRequestedSlot(requestedDate, requestedTime) || !Number.isInteger(partySize) || partySize < 1 || partySize > 50) {
    return jsonError("Add name, valid email, date/time, and party size.", 400);
  }

  const listing = await getPublicListingByIdOrSlugForServer({ listingId, listingSlug });
  if (!listing) return jsonError("This deal is not available for booking requests.", 404);
  if (listing.isDemo) return jsonError("Demo deals are examples only and cannot receive booking requests.", 409);
  if (!isOpenListing(listing)) return jsonError("This offer has ended or has no spots left. Choose another deal.", 409);
  if (listing.remainingSpots !== null && partySize > listing.remainingSpots) return jsonError("Your party is larger than the remaining spots. Please choose another offer.", 400);

  const emailPayload = {
    businessName: listing.businessName,
    email,
    listingId: listing.id,
    listingTitle: listing.title,
    message,
    name,
    partySize,
    phone,
    requestedDate,
    requestedTime
  };

  const requestPayload = {
    ...emailPayload,
    businessId: listing.businessId,
    businessOwnerIds: listing.ownerIds,
    cityId: listing.cityId,
    createdAt: FieldValue.serverTimestamp(),
    status: "pending",
    updatedAt: FieldValue.serverTimestamp(),
    userId: token.uid
  };

  const db = getFirebaseAdminDb();
  if (!db) {
    return jsonError("Booking requests are temporarily unavailable.", 503);
  }

  const docRef = await db.collection("bookingRequests").add(requestPayload);
  if (requestPayload.listingId) {
    await db.collection("listings").doc(requestPayload.listingId).set(
      {
        metricsUpdatedAt: FieldValue.serverTimestamp(),
        requestCount: FieldValue.increment(1)
      },
      { merge: true }
    ).catch(() => undefined);
  }
  const [notification, businessPush, customerPush] = await Promise.all([
    sendBookingRequestNotifications({
      listing,
      request: emailPayload,
      requestId: docRef.id
    }).catch((error) => ({
      configured: false,
      results: [{ attempted: true, error: error instanceof Error ? error.message : "Could not send notification.", ok: false, provider: "resend" as const, to: [] }],
      status: "partial"
    })),
    sendPushToUsers({
      body: `${name} requested ${requestedDate} at ${requestedTime} for ${partySize}.`,
      data: { bookingRequestId: docRef.id, link: "/partner/dashboard", type: "booking_request_new" },
      notificationId: `booking-request-new-${docRef.id}`,
      title: `New request: ${listing.title}`,
      userIds: listing.ownerIds
    }).catch(() => ({ attempted: 0, failed: 0, inAppCreated: 0, sent: 0, status: "skipped" as const })),
    sendPushToUsers({
      body: `${listing.businessName} will confirm availability before anything is charged.`,
      data: { bookingRequestId: docRef.id, link: "/profile", type: "booking_request_pending" },
      notificationId: `booking-request-pending-${docRef.id}`,
      title: "Booking request sent",
      userIds: [token.uid]
    }).catch(() => ({ attempted: 0, failed: 0, inAppCreated: 0, sent: 0, status: "skipped" as const }))
  ]);

  await docRef.set(
    {
      notificationResults: notification.results,
      notificationStatus: notification.status,
      notificationUpdatedAt: FieldValue.serverTimestamp(),
      pushResults: { business: businessPush, customer: customerPush }
    },
    { merge: true }
  ).catch(() => undefined);

  void incrementServerGlobalStats(["bookingRequests"]).catch(() => false);
  return jsonOk({
    notificationStatus: notification.status,
    pushStatus: businessPush.status === "sent" || customerPush.status === "sent" ? "sent" : "skipped",
    requestId: docRef.id,
    synced: true
  }, 201);
}

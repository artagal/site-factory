import { jsonError, jsonOk } from "../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb, verifyBearerToken } from "../../../lib/server/firebase-admin";
import { getClientIp, checkRateLimit } from "../../../lib/server/rate-limit";
import { getListingBySlug } from "../../../lib/search";
import { incrementServerGlobalStats } from "../../../lib/server/stats";

function clean(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
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
  const listing = listingSlug ? getListingBySlug(listingSlug) : undefined;

  const name = clean(body?.name, 120);
  const email = clean(body?.email, 254).toLowerCase();
  const phone = clean(body?.phone, 40) || null;
  const requestedDate = clean(body?.requestedDate, 40);
  const requestedTime = clean(body?.requestedTime, 40);
  const message = clean(body?.message, 600);
  const partySize = Number(body?.partySize ?? 0);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !requestedDate || !requestedTime || !Number.isInteger(partySize) || partySize < 1 || partySize > 50) {
    return jsonError("Add name, valid email, date/time, and party size.", 400);
  }

  const requestPayload = {
    businessId: listing?.businessId ?? clean(body?.businessId, 120),
    businessName: listing?.businessName ?? clean(body?.businessName, 180),
    businessOwnerIds: listing?.ownerIds ?? [],
    cityId: listing?.cityId ?? clean(body?.cityId, 120),
    createdAt: FieldValue.serverTimestamp(),
    email,
    listingId: listing?.id ?? listingId,
    listingTitle: listing?.title ?? clean(body?.listingTitle, 180),
    message,
    name,
    partySize,
    phone,
    requestedDate,
    requestedTime,
    status: "pending",
    updatedAt: FieldValue.serverTimestamp(),
    userId: token.uid
  };

  const db = getFirebaseAdminDb();
  if (!db) return jsonOk({ requestId: `local-${Date.now()}`, synced: false });

  const docRef = await db.collection("bookingRequests").add(requestPayload);
  if (requestPayload.listingId) {
    await db.collection("listings").doc(requestPayload.listingId).set(
      {
        metricsUpdatedAt: FieldValue.serverTimestamp(),
        requestCount: FieldValue.increment(1)
      },
      { merge: true }
    );
  }
  void incrementServerGlobalStats(["bookingRequests"]).catch(() => false);
  return jsonOk({ requestId: docRef.id, synced: true }, 201);
}

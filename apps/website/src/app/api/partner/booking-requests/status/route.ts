import { jsonError, jsonOk } from "../../../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb, verifyBearerToken } from "../../../../../lib/server/firebase-admin";

const STATUSES = new Set(["contacted", "confirmed", "cancelled", "rejected"]);

function clean(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const requestId = clean(body?.requestId, 160);
  const status = clean(body?.status, 40);

  if (!requestId || !STATUSES.has(status)) {
    return jsonError("Add requestId and a valid booking status.", 400);
  }

  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Firebase Admin is required for booking request updates.", 503);

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

  await requestRef.set(
    {
      lastStatusChangedAt: FieldValue.serverTimestamp(),
      lastStatusChangedBy: token.uid,
      status,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  return jsonOk({ requestId, status });
}

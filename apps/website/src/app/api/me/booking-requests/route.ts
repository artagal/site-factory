import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { getFirebaseAdminDb, verifyBearerToken } from "../../../../lib/server/firebase-admin";

export async function GET(request: Request): Promise<Response> {
  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in to load booking requests.", 401);
  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Booking history is not connected yet.", 503);
  const snapshot = await db.collection("bookingRequests")
    .where("userId", "==", token.uid)
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();
  return jsonOk({ bookingRequests: snapshot.docs.map((requestDoc) => ({ id: requestDoc.id, ...requestDoc.data() })) });
}

import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { getFirebaseAdminDb, verifyBearerToken } from "../../../../lib/server/firebase-admin";
import type { DocumentData } from "firebase-admin/firestore";

export async function GET(request: Request): Promise<Response> {
  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in as a business owner to load booking requests.", 401);

  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Live partner tools are not connected yet.", 503);

  const snapshot = await db
    .collection("bookingRequests")
    .where("businessOwnerIds", "array-contains", token.uid)
    .get();
  const bookingRequests = snapshot.docs
    .map((requestDoc): DocumentData & { id: string } => ({ id: requestDoc.id, ...requestDoc.data() }))
    .sort((left, right) => {
      const leftMillis = typeof left.updatedAt?.toMillis === "function" ? left.updatedAt.toMillis() : 0;
      const rightMillis = typeof right.updatedAt?.toMillis === "function" ? right.updatedAt.toMillis() : 0;
      return rightMillis - leftMillis;
    })
    .slice(0, 100);

  return jsonOk({ bookingRequests, count: bookingRequests.length });
}

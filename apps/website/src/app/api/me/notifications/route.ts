import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { getFirebaseAdminDb, verifyBearerToken } from "../../../../lib/server/firebase-admin";

export async function GET(request: Request): Promise<Response> {
  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in to load notifications.", 401);
  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Notifications are not connected yet.", 503);
  const snapshot = await db.collection("users").doc(token.uid).collection("notifications")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  return jsonOk({ notifications: snapshot.docs.map((notificationDoc) => ({ id: notificationDoc.id, ...notificationDoc.data() })) });
}

import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { getFirebaseAdminAuth, getFirebaseAdminDb, isFirebaseAdminConfigured, verifyBearerToken } from "../../../../lib/server/firebase-admin";
import { getClientIp, checkRateLimit } from "../../../../lib/server/rate-limit";

async function deleteKnownUserSubcollections(userId: string) {
  const db = getFirebaseAdminDb();
  if (!db) return false;

  const userRef = db.collection("users").doc(userId);
  const subcollections = ["completedChallenges", "savedChallenges"];

  for (const subcollection of subcollections) {
    let snapshot = await userRef.collection(subcollection).limit(400).get();
    while (!snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach((document) => batch.delete(document.ref));
      await batch.commit();
      snapshot = await userRef.collection(subcollection).limit(400).get();
    }
  }

  await userRef.delete();
  return true;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`delete-account:${ip}`, 6, 60 * 60_000);

  if (!limit.allowed) {
    return jsonError("Too many account deletion attempts. Try again later.", 429);
  }

  if (!isFirebaseAdminConfigured()) {
    return jsonError("Firebase Admin is not configured for account deletion yet.", 503);
  }

  const decoded = await verifyBearerToken(request).catch(() => null);
  const auth = getFirebaseAdminAuth();

  if (!decoded || !auth) {
    return jsonError("Valid Firebase login required.", 401);
  }

  await deleteKnownUserSubcollections(decoded.uid);
  await auth.deleteUser(decoded.uid);

  return jsonOk({
    deleted: true
  });
}

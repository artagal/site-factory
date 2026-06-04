import type { Firestore, QuerySnapshot } from "firebase-admin/firestore";
import {
  USER_DOCUMENT_SUBCOLLECTIONS,
  USER_FIELD_OWNED_COLLECTIONS,
  USER_OWNED_COLLECTIONS,
  USER_TOP_LEVEL_DOCUMENTS
} from "../../../../lib/account-deletion";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { getFirebaseAdminAuth, getFirebaseAdminDb, isFirebaseAdminConfigured, verifyBearerToken } from "../../../../lib/server/firebase-admin";
import { getClientIp, checkRateLimit } from "../../../../lib/server/rate-limit";

async function deleteQueryInBatches(db: Firestore, getNextBatch: () => Promise<QuerySnapshot>) {
  let snapshot = await getNextBatch();

  while (!snapshot.empty) {
    const batch = db.batch();
    snapshot.docs.forEach((document) => batch.delete(document.ref));
    await batch.commit();
    snapshot = await getNextBatch();
  }

  return true;
}

async function deleteKnownUserSubcollections(userId: string) {
  const db = getFirebaseAdminDb();
  if (!db) return false;
  const userRef = db.collection("users").doc(userId);

  for (const subcollection of USER_DOCUMENT_SUBCOLLECTIONS) {
    await deleteQueryInBatches(db, () => userRef.collection(subcollection).limit(400).get());
  }

  await userRef.delete();
  return true;
}

async function deleteKnownTopLevelUserRecords(userId: string) {
  const db = getFirebaseAdminDb();
  if (!db) return false;

  for (const collectionName of USER_OWNED_COLLECTIONS) {
    await deleteQueryInBatches(db, () => db.collection(collectionName).where("userId", "==", userId).limit(400).get());
  }

  for (const collectionName of USER_TOP_LEVEL_DOCUMENTS) {
    await db.collection(collectionName).doc(userId).delete();
  }

  for (const { collectionName, fieldPath } of USER_FIELD_OWNED_COLLECTIONS) {
    await deleteQueryInBatches(db, () => db.collection(collectionName).where(fieldPath, "==", userId).limit(400).get());
  }

  return true;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`delete-account:${ip}`, 6, 60 * 60_000);

  if (!limit.allowed) {
    return jsonError("Too many account deletion attempts. Try again later.", 429);
  }

  if (!isFirebaseAdminConfigured()) {
    return jsonError("Account deletion is not connected yet.", 503);
  }

  const decoded = await verifyBearerToken(request).catch(() => null);
  const auth = getFirebaseAdminAuth();

  if (!decoded || !auth) {
    return jsonError("Valid login required.", 401);
  }

  const deletedUserRecords = await deleteKnownTopLevelUserRecords(decoded.uid);
  const deletedUserDocument = await deleteKnownUserSubcollections(decoded.uid);

  if (!deletedUserRecords || !deletedUserDocument) {
    return jsonError("Account deletion is not connected yet.", 503);
  }

  await auth.deleteUser(decoded.uid);

  return jsonOk({
    deleted: true
  });
}

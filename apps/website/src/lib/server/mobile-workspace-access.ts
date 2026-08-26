import type { DecodedIdToken } from "firebase-admin/auth";
import type { DocumentData, Firestore } from "firebase-admin/firestore";
import { mobileId } from "../mobile-workspace";
import { getFirebaseAdminDb, verifyBearerToken } from "./firebase-admin";

export class MobileError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

export type MobileActor = { db: Firestore; token: DecodedIdToken; isAdmin: boolean };

export async function mobileActor(request: Request): Promise<MobileActor> {
  const token = await verifyBearerToken(request).catch(() => null);
  if (!token) throw new MobileError("Sign in to continue.", 401);
  const db = getFirebaseAdminDb();
  if (!db) throw new MobileError("Account services are temporarily unavailable.", 503);
  const admin = await db.collection("admins").doc(token.uid).get();
  return { db, token, isAdmin: admin.exists };
}

export function requireMobileAdmin(actor: MobileActor): void {
  if (!actor.isAdmin) throw new MobileError("Administrator access is required.", 403);
}

export async function mobileBusiness(actor: MobileActor, requestedId: string): Promise<{ id: string; data: DocumentData }> {
  const snapshot = requestedId
    ? await actor.db.collection("businesses").doc(mobileId(requestedId) || "__invalid__").get()
    : (await actor.db.collection("businesses").where("ownerIds", "array-contains", actor.token.uid).where("status", "==", "approved").limit(1).get()).docs[0];
  const data = snapshot?.data();
  if (!data || !Array.isArray(data.ownerIds) || !data.ownerIds.includes(actor.token.uid)) {
    throw new MobileError("An approved business linked to your account is required.", 403);
  }
  if (data.status !== "approved" || data.isDemo === true) throw new MobileError("Business approval is required.", 403);
  return { id: snapshot.id, data };
}

export async function mobileBooking(actor: MobileActor, id: string, audience: "customer" | "partner" | "admin") {
  if (!mobileId(id)) throw new MobileError("Choose a booking request.");
  if (audience === "admin") requireMobileAdmin(actor);
  const ref = actor.db.collection("bookingRequests").doc(id);
  const snapshot = await ref.get();
  const data = snapshot.data();
  if (!data) throw new MobileError("Request not found.", 404);
  if (audience === "customer" && data.userId !== actor.token.uid) throw new MobileError("Request not found.", 404);
  if (audience === "partner") {
    const businessId = mobileId(data.businessId);
    if (!businessId) throw new MobileError("Request not found.", 404);
    await mobileBusiness(actor, businessId);
  }
  return { data, ref };
}

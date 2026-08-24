import type { DecodedIdToken } from "firebase-admin/auth";
import type { DocumentData, Firestore } from "firebase-admin/firestore";
import { jsonError } from "./api-response";
import { getFirebaseAdminDb, verifyBearerToken } from "./firebase-admin";

export type VerifiedAiUser = {
  db: Firestore;
  isAdmin: boolean;
  token: DecodedIdToken;
};

export type VerifiedAiBusinessUser = VerifiedAiUser & {
  business: DocumentData;
};

export async function verifyAiUser(request: Request): Promise<VerifiedAiUser | { error: Response }> {
  const token = await verifyBearerToken(request);
  if (!token) return { error: jsonError("Sign in before using this assistant.", 401) };

  const db = getFirebaseAdminDb();
  if (!db) return { error: jsonError("Live account verification is not connected yet.", 503) };

  const [admin, legacyAdmin] = await Promise.all([
    db.collection("admins").doc(token.uid).get(),
    db.collection("admin_users").doc(token.uid).get()
  ]);

  return { db, isAdmin: admin.exists || legacyAdmin.exists, token };
}

export async function verifyAiBusinessUser(
  request: Request,
  businessId: string
): Promise<VerifiedAiBusinessUser | { error: Response }> {
  if (!businessId) return { error: jsonError("Choose a business first.", 400) };
  const verified = await verifyAiUser(request);
  if ("error" in verified) return verified;

  const snapshot = await verified.db.collection("businesses").doc(businessId).get();
  const business = snapshot.data();
  const ownerIds = Array.isArray(business?.ownerIds) ? business.ownerIds.map(String) : [];
  const ownerUserId = typeof business?.ownerUserId === "string" ? business.ownerUserId : "";

  if (!snapshot.exists || (!verified.isAdmin && !ownerIds.includes(verified.token.uid) && ownerUserId !== verified.token.uid)) {
    return { error: jsonError("You do not have access to this business.", 403) };
  }

  return { ...verified, business: business ?? {} };
}

export async function getOptionalAiRole(request: Request) {
  const token = await verifyBearerToken(request).catch(() => null);
  const db = getFirebaseAdminDb();
  if (!token || !db) return { role: null as "user" | "business" | "admin" | null, scopeKey: null as string | null };

  const [admin, legacyAdmin, businesses] = await Promise.all([
    db.collection("admins").doc(token.uid).get(),
    db.collection("admin_users").doc(token.uid).get(),
    db.collection("businesses").where("ownerIds", "array-contains", token.uid).limit(1).get()
  ]);

  return {
    role: admin.exists || legacyAdmin.exists ? "admin" as const : businesses.empty ? "user" as const : "business" as const,
    scopeKey: token.uid
  };
}


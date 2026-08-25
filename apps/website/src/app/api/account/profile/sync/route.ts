import { jsonError, jsonOk } from "../../../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb, verifyBearerToken } from "../../../../../lib/server/firebase-admin";

export async function POST(request: Request): Promise<Response> {
  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in to synchronize your account.", 401);

  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Account synchronization is not connected yet.", 503);

  const profileRef = db.collection("users").doc(token.uid);
  const snapshot = await profileRef.get();
  const existing = snapshot.data() ?? {};
  const role = existing.role === "business" ? "business" : "user";
  const accountStatus = existing.accountStatus === "pending" ? "pending" : "active";

  await profileRef.set({
    accountStatus,
    createdAt: existing.createdAt ?? FieldValue.serverTimestamp(),
    displayName: typeof token.name === "string" && token.name.trim()
      ? token.name.trim().slice(0, 120)
      : typeof existing.displayName === "string"
        ? existing.displayName
        : "GoFunMotion user",
    email: typeof token.email === "string" ? token.email : null,
    isAnonymous: token.firebase?.sign_in_provider === "anonymous",
    lastLoginAt: FieldValue.serverTimestamp(),
    notificationPreferences: typeof existing.notificationPreferences === "object" && existing.notificationPreferences
      ? existing.notificationPreferences
      : {},
    phone: typeof token.phone_number === "string"
      ? token.phone_number
      : typeof existing.phone === "string"
        ? existing.phone
        : null,
    photoURL: typeof token.picture === "string"
      ? token.picture
      : typeof existing.photoURL === "string"
        ? existing.photoURL
        : null,
    preferredCategories: Array.isArray(existing.preferredCategories)
      ? existing.preferredCategories.map(String).slice(0, 30)
      : [],
    preferredCityId: typeof existing.preferredCityId === "string" ? existing.preferredCityId : null,
    role,
    updatedAt: FieldValue.serverTimestamp()
  });

  return jsonOk({ role, synced: true });
}

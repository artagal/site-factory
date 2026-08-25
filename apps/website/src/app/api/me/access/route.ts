import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { getFirebaseAdminDb, verifyBearerToken } from "../../../../lib/server/firebase-admin";

export async function GET(request: Request): Promise<Response> {
  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in to load account access.", 401);

  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Account access is not connected yet.", 503);

  const [profileSnapshot, adminSnapshot, businessSnapshot] = await Promise.all([
    db.collection("users").doc(token.uid).get(),
    db.collection("admins").doc(token.uid).get(),
    db.collection("businesses").where("ownerIds", "array-contains", token.uid).get()
  ]);
  const profile = profileSnapshot.data() ?? {};
  const businesses = businessSnapshot.docs.map((businessDoc) => ({
    id: businessDoc.id,
    name: String(businessDoc.data().name ?? "Business"),
    status: String(businessDoc.data().status ?? "pending")
  }));
  const isAdmin = adminSnapshot.exists;
  const role = isAdmin ? "admin" : businesses.length || profile.role === "business" ? "business" : "user";

  return jsonOk({
    businesses,
    defaultRoute: isAdmin ? "/admin" : role === "business" ? "/partner/dashboard" : "/deals",
    isAdmin,
    primaryBusinessId: businesses[0]?.id ?? "",
    role,
    uid: token.uid
  });
}

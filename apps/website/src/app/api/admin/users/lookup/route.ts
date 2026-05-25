import { jsonError, jsonOk } from "../../../../../lib/server/api-response";
import { getFirebaseAdminAuth, getFirebaseAdminDb, verifyBearerToken } from "../../../../../lib/server/firebase-admin";

function clean(value: unknown, max = 254) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function verifyAdmin(request: Request) {
  const token = await verifyBearerToken(request);
  if (!token) return null;

  const db = getFirebaseAdminDb();
  if (!db) return null;

  const adminSnapshot = await db.collection("admins").doc(token.uid).get();
  return adminSnapshot.exists ? token : null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const email = clean(body?.email).toLowerCase();

  if (!email || !isEmail(email)) {
    return jsonError("Enter a valid account email.", 400);
  }

  const auth = getFirebaseAdminAuth();
  const db = getFirebaseAdminDb();
  if (!auth || !db) return jsonError("Account lookup is not connected yet.", 503);

  const adminToken = await verifyAdmin(request);
  if (!adminToken) return jsonError("Admin access is required.", 401);

  const user = await auth.getUserByEmail(email).catch(() => null);
  if (!user) return jsonError("No account was found for that email.", 404);

  return jsonOk({
    disabled: user.disabled,
    displayName: user.displayName ?? null,
    email: user.email ?? email,
    photoURL: user.photoURL ?? null,
    uid: user.uid
  });
}

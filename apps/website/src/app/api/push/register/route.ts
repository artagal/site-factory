import { createHash } from "node:crypto";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb, verifyBearerToken } from "../../../../lib/server/firebase-admin";

const PLATFORMS = new Set(["ios", "android", "web"]);

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request): Promise<Response> {
  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in to enable notifications.", 401);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const deviceToken = clean(body?.token, 4096);
  const platform = clean(body?.platform, 20).toLowerCase();
  if (deviceToken.length <= 20 || !PLATFORMS.has(platform)) {
    return jsonError("Add a valid notification token and platform.", 400);
  }

  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Push notifications are not connected yet.", 503);

  const tokenId = createHash("sha256").update(deviceToken).digest("hex");
  const tokenRef = db.collection("users").doc(token.uid).collection("deviceTokens").doc(tokenId);
  const previousOwners = await db.collectionGroup("deviceTokens")
    .where("token", "==", deviceToken)
    .limit(20)
    .get();
  await Promise.all(previousOwners.docs
    .filter((tokenDoc) => tokenDoc.ref.path !== tokenRef.path)
    .map((tokenDoc) => tokenDoc.ref.delete()));

  await tokenRef.set({
    appVersion: clean(body?.appVersion, 40) || null,
    createdAt: FieldValue.serverTimestamp(),
    enabled: body?.enabled !== false,
    lastSeenAt: FieldValue.serverTimestamp(),
    locale: clean(body?.locale, 30) || null,
    platform,
    token: deviceToken,
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  return jsonOk({ registered: true, tokenId }, 201);
}

import { slugify } from "../../../../lib/slug";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb, verifyBearerToken } from "../../../../lib/server/firebase-admin";

function clean(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function verifyAdmin(request: Request) {
  const token = await verifyBearerToken(request);
  if (!token) return null;

  const db = getFirebaseAdminDb();
  if (!db) return null;

  const adminSnapshot = await db.collection("admins").doc(token.uid).get();
  return adminSnapshot.exists ? token : null;
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const name = clean(body?.name, 120);
  const state = clean(body?.state, 80);
  const country = clean(body?.country, 80) || "US";
  const timezone = clean(body?.timezone, 80) || "America/New_York";
  const description = clean(body?.description, 600) || `${name} last-minute fun deals and local activity openings.`;
  const slug = slugify(clean(body?.slug, 120) || name);

  if (!name || !slug || !state) return jsonError("Add city name, state, and valid slug.", 400);

  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Firebase Admin is required for city management.", 503);

  const adminToken = await verifyAdmin(request);
  if (!adminToken) return jsonError("Admin access is required.", 401);

  const cityId = slug;
  await db.collection("cities").doc(cityId).set(
    {
      active: body?.active !== false,
      comingSoon: body?.comingSoon === true,
      country,
      createdAt: FieldValue.serverTimestamp(),
      description,
      heroImageUrl: clean(body?.heroImageUrl, 500) || null,
      lastManagedBy: adminToken.uid,
      name,
      slug,
      state,
      timezone,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  return jsonOk({ cityId, slug }, 201);
}

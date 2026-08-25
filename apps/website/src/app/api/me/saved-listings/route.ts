import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb, verifyBearerToken } from "../../../../lib/server/firebase-admin";
import { getPublicListingByIdOrSlugForServer } from "../../../../lib/server/public-listings";

function clean(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET(request: Request): Promise<Response> {
  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in to load saved deals.", 401);
  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Saved deals are not connected yet.", 503);

  const snapshot = await db.collection("users").doc(token.uid).collection("savedListings").orderBy("savedAt", "desc").get();
  return jsonOk({
    savedListings: snapshot.docs.map((savedDoc) => {
      const data = savedDoc.data();
      const listing = data.listingSnapshot && typeof data.listingSnapshot === "object"
        ? data.listingSnapshot as Record<string, unknown>
        : {};
      return {
        city: clean(listing.cityName || listing.city, 120),
        id: savedDoc.id,
        listingId: clean(data.listingId, 180) || savedDoc.id,
        listingSnapshot: listing,
        listingTitle: clean(listing.title, 180) || "Saved deal",
        savedAt: data.savedAt ?? null
      };
    })
  });
}

export async function POST(request: Request): Promise<Response> {
  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in to save deals.", 401);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const listingId = clean(body?.listingId, 180);
  const listingSlug = clean(body?.listingSlug, 180);
  const listing = await getPublicListingByIdOrSlugForServer({ listingId, listingSlug });
  if (!listing || listing.isDemo) return jsonError("Only approved live deals can be saved.", 404);

  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Saved deals are not connected yet.", 503);
  const savedRef = db.collection("users").doc(token.uid).collection("savedListings").doc(listing.id);
  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(savedRef);
    transaction.set(savedRef, {
      listingId: listing.id,
      listingSnapshot: listing,
      savedAt: FieldValue.serverTimestamp()
    });
    if (!existing.exists) {
      transaction.set(db.collection("listings").doc(listing.id), {
        metricsUpdatedAt: FieldValue.serverTimestamp(),
        saveCount: FieldValue.increment(1)
      }, { merge: true });
    }
  });

  return jsonOk({ listingId: listing.id, saved: true }, 201);
}

export async function DELETE(request: Request): Promise<Response> {
  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in to remove saved deals.", 401);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const listingId = clean(body?.listingId, 180);
  if (!listingId) return jsonError("Add listingId.", 400);
  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Saved deals are not connected yet.", 503);

  const savedRef = db.collection("users").doc(token.uid).collection("savedListings").doc(listingId);
  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(savedRef);
    if (!existing.exists) return;
    transaction.delete(savedRef);
    transaction.set(db.collection("listings").doc(listingId), {
      metricsUpdatedAt: FieldValue.serverTimestamp(),
      saveCount: FieldValue.increment(-1)
    }, { merge: true });
  });

  return jsonOk({ listingId, saved: false });
}

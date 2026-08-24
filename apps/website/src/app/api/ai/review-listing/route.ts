import { FieldValue } from "../../../../lib/server/firebase-admin";
import { listingReviewInputFromRecord, reviewListingWithAi } from "../../../../lib/ai/listing-review-agent";
import { verifyAiBusinessUser, verifyAiUser } from "../../../../lib/server/ai-authorization";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import type { DocumentData, DocumentReference } from "firebase-admin/firestore";

function clean(value: unknown, max = 160) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const listingId = clean(body?.listingId);
  const requestedBusinessId = clean(body?.businessId, 140);
  const persist = body?.persist === true;
  let record: Record<string, unknown>;
  let listingRef: DocumentReference<DocumentData> | null = null;
  let scopeKey = "";

  if (listingId) {
    const verified = await verifyAiUser(request);
    if ("error" in verified) return verified.error;
    const reference = verified.db.collection("listings").doc(listingId);
    const snapshot = await reference.get();
    const listing = snapshot.data();
    if (!snapshot.exists || !listing) return jsonError("Listing was not found.", 404);
    const businessId = clean(listing.businessId, 140);
    const businessSnapshot = await verified.db.collection("businesses").doc(businessId).get();
    const business = businessSnapshot.data();
    const ownerIds = Array.isArray(business?.ownerIds) ? business.ownerIds.map(String) : [];
    const ownerUserId = typeof business?.ownerUserId === "string" ? business.ownerUserId : "";
    if (!verified.isAdmin && !ownerIds.includes(verified.token.uid) && ownerUserId !== verified.token.uid) {
      return jsonError("You do not have access to this listing.", 403);
    }
    record = listing as Record<string, unknown>;
    listingRef = reference;
    scopeKey = verified.token.uid;
  } else {
    const verified = await verifyAiBusinessUser(request, requestedBusinessId);
    if ("error" in verified) return verified.error;
    record = body?.listing && typeof body.listing === "object"
      ? body.listing as Record<string, unknown>
      : body ?? {};
    scopeKey = verified.token.uid;
  }

  const result = await reviewListingWithAi({ input: listingReviewInputFromRecord(record), scopeKey });
  if (listingId && persist && listingRef) {
    await listingRef.set(
      {
        aiReview: {
          ...result.review,
          provider: result.provider,
          reviewedAt: FieldValue.serverTimestamp(),
          version: 1
        },
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
  }

  return jsonOk({
    ...result,
    persisted: Boolean(listingId && persist),
    review: { ...result.review, provider: result.provider }
  });
}

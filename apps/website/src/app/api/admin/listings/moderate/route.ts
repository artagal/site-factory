import { jsonError, jsonOk } from "../../../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb, verifyBearerToken } from "../../../../../lib/server/firebase-admin";
import { canFeatureListings, canPromoteListings } from "../../../../../lib/partner-limits";

const ACTIONS = new Set([
  "approve",
  "reject",
  "publish",
  "pause",
  "expire",
  "feature",
  "unfeature",
  "promote",
  "unpromote"
]);

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
  const listingId = clean(body?.listingId, 160);
  const action = clean(body?.action, 40);

  if (!listingId || !ACTIONS.has(action)) {
    return jsonError("Add listingId and a valid moderation action.", 400);
  }

  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Firebase Admin is required for listing moderation.", 503);

  const adminToken = await verifyAdmin(request);
  if (!adminToken) return jsonError("Admin access is required.", 401);

  const listingRef = db.collection("listings").doc(listingId);
  const listingSnapshot = await listingRef.get();
  if (!listingSnapshot.exists) return jsonError("Listing was not found.", 404);

  const listing = listingSnapshot.data() ?? {};
  const now = FieldValue.serverTimestamp();
  const moderationBase = {
    lastModeratedAt: now,
    lastModeratedBy: adminToken.uid,
    updatedAt: now
  };

  if (action === "approve") {
    await listingRef.set(
      {
        ...moderationBase,
        approvalStatus: "approved",
        rejectionReason: null,
        status: "published"
      },
      { merge: true }
    );
    return jsonOk({ action, approvalStatus: "approved", listingId, status: "published" });
  }

  if (action === "reject") {
    await listingRef.set(
      {
        ...moderationBase,
        approvalStatus: "rejected",
        featured: false,
        promoted: false,
        rejectionReason: clean(body?.reason, 600) || "Listing rejected by admin.",
        status: "paused"
      },
      { merge: true }
    );
    return jsonOk({ action, approvalStatus: "rejected", listingId, status: "paused" });
  }

  if (action === "publish") {
    if (listing.approvalStatus !== "approved") {
      return jsonError("Approve this listing before publishing it.", 400);
    }

    await listingRef.set({ ...moderationBase, status: "published" }, { merge: true });
    return jsonOk({ action, listingId, status: "published" });
  }

  if (action === "pause") {
    await listingRef.set({ ...moderationBase, status: "paused" }, { merge: true });
    return jsonOk({ action, listingId, status: "paused" });
  }

  if (action === "expire") {
    await listingRef.set({ ...moderationBase, featured: false, promoted: false, status: "expired" }, { merge: true });
    return jsonOk({ action, listingId, status: "expired" });
  }

  if (action === "feature" || action === "promote") {
    if (listing.approvalStatus !== "approved" || listing.status !== "published") {
      return jsonError("Only approved published listings can be featured or promoted.", 400);
    }

    const businessId = typeof listing.businessId === "string" ? listing.businessId : "";
    const businessSnapshot = businessId ? await db.collection("businesses").doc(businessId).get() : null;
    const business = businessSnapshot?.data() ?? {};

    if (action === "feature" && !canFeatureListings({
      paidAccessEnabled: business.paidAccessEnabled === true,
      pricingTier: business.pricingTier,
      subscriptionStatus: typeof business.subscriptionStatus === "string" ? business.subscriptionStatus : null
    })) {
      return jsonError("Featured placement requires an active Growth or Pro subscription.", 402);
    }

    if (action === "promote" && !canPromoteListings({
      paidAccessEnabled: business.paidAccessEnabled === true,
      pricingTier: business.pricingTier,
      subscriptionStatus: typeof business.subscriptionStatus === "string" ? business.subscriptionStatus : null
    })) {
      return jsonError("Promoted campaigns require an active Pro subscription.", 402);
    }
  }

  if (action === "feature") {
    await listingRef.set({ ...moderationBase, featured: true }, { merge: true });
    return jsonOk({ action, featured: true, listingId });
  }

  if (action === "unfeature") {
    await listingRef.set({ ...moderationBase, featured: false }, { merge: true });
    return jsonOk({ action, featured: false, listingId });
  }

  if (action === "promote") {
    await listingRef.set({ ...moderationBase, promoted: true }, { merge: true });
    return jsonOk({ action, listingId, promoted: true });
  }

  await listingRef.set({ ...moderationBase, promoted: false }, { merge: true });
  return jsonOk({ action, listingId, promoted: false });
}

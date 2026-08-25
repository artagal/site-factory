import { slugify } from "../../../../lib/slug";
import { normalizeAvailableDays } from "../../../../lib/availability";
import { listingReviewInputFromRecord, reviewListingWithAi } from "../../../../lib/ai/listing-review-agent";
import { countLimitedListings, getPartnerTierCapabilities, isLimitedListingStatus } from "../../../../lib/partner-limits";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb, verifyBearerToken } from "../../../../lib/server/firebase-admin";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { DocumentData, DocumentReference, Firestore } from "firebase-admin/firestore";
import type { BudgetTier, GroupType, IndoorOutdoor, ListingType, PlanVibe } from "../../../../types/deals";

const GROUP_TYPES = new Set<GroupType>(["solo", "date", "friends", "family", "kids"]);
const INDOOR_OUTDOOR = new Set<IndoorOutdoor>(["indoor", "outdoor", "either"]);
const LISTING_TYPES = new Set<ListingType>(["deal", "activity", "event", "class", "experience"]);
const VIBES = new Set<PlanVibe>([
  "chill",
  "romantic",
  "active",
  "social",
  "creative",
  "family-friendly",
  "adventurous",
  "low-energy",
  "rainy-day",
  "surprise-me"
]);

function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanNullable(value: unknown, max = 500) {
  const next = clean(value, max);
  return next || null;
}

function cleanNumber(value: unknown, min: number, max: number, fallback: number) {
  const next = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(next)) return fallback;
  return Math.min(Math.max(next, min), max);
}

function cleanNullableNumber(value: unknown, min: number, max: number) {
  if (value === null || value === undefined || value === "") return null;
  const next = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(next)) return null;
  return Math.min(Math.max(next, min), max);
}

function cleanStringArray(value: unknown, maxItems = 12, maxLength = 80) {
  return Array.isArray(value)
    ? value.map((item) => clean(item, maxLength)).filter(Boolean).slice(0, maxItems)
    : [];
}

function cleanEnumArray<T extends string>(value: unknown, allowed: Set<T>, fallback: T[]) {
  const items = cleanStringArray(value, 12, 80).filter((item): item is T => allowed.has(item as T));
  return items.length ? items : fallback;
}

function budgetTierForPrice(price: number): BudgetTier {
  if (price <= 0) return "free";
  if (price <= 25) return "under25";
  if (price <= 50) return "under50";
  if (price <= 100) return "under100";
  return "premium";
}

function discountPercent(originalPrice: number | null, price: number) {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function titleizeSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type OwnedBusinessResult =
  | { business: DocumentData; db: Firestore; token: DecodedIdToken }
  | { error: Response };

type OwnedListingResult =
  | { db: Firestore; listing: DocumentData; listingRef: DocumentReference; token: DecodedIdToken }
  | { error: Response };

async function verifyOwnedBusiness(request: Request, businessId: string): Promise<OwnedBusinessResult> {
  const token = await verifyBearerToken(request);
  if (!token) return { error: jsonError("Sign in as the business owner before saving listings.", 401) };

  const db = getFirebaseAdminDb();
  if (!db) return { error: jsonError("Live partner tools are not connected yet.", 503) };

  const businessSnapshot = await db.collection("businesses").doc(businessId).get();
  const business = businessSnapshot.data();
  const ownerIds = Array.isArray(business?.ownerIds) ? business.ownerIds.map(String) : [];

  if (!businessSnapshot.exists || !ownerIds.includes(token.uid)) {
    return { error: jsonError("You do not have access to this business.", 403) };
  }

  if (business?.status !== "approved") {
    return { error: jsonError("Business must be approved before creating live deal drafts.", 403) };
  }

  return { business, db, token };
}

async function getBusinessListingLimitState(db: Firestore, businessId: string, business: DocumentData, excludeListingId?: string) {
  const listingSnapshot = await db.collection("listings").where("businessId", "==", businessId).get();
  const listings = listingSnapshot.docs.map((item) => ({
    id: item.id,
    status: String(item.data().status ?? "")
  }));
  const activeCount = countLimitedListings(listings, excludeListingId);
  const capabilities = getPartnerTierCapabilities({
    paidAccessEnabled: business.paidAccessEnabled === true,
    pricingTier: business.pricingTier
  });

  return { activeCount, capabilities };
}

async function assertCanUseLimitedListingSlot(db: Firestore, businessId: string, business: DocumentData, excludeListingId?: string) {
  const { activeCount, capabilities } = await getBusinessListingLimitState(db, businessId, business, excludeListingId);

  if (Number.isFinite(capabilities.activeListings) && activeCount >= capabilities.activeListings) {
    return jsonError(
      `${capabilities.label} is limited to ${capabilities.activeListings} active ${capabilities.activeListings === 1 ? "deal" : "deals"}. Upgrade or pause an existing listing.`,
      402
    );
  }

  return null;
}

async function verifyOwnedListing(request: Request, businessId: string, listingId: string): Promise<OwnedListingResult> {
  if (!listingId) return { error: jsonError("Choose a listing before updating status.", 400) };

  const verified = await verifyOwnedBusiness(request, businessId);
  if ("error" in verified) return verified;

  const listingRef = verified.db.collection("listings").doc(listingId);
  const listingSnapshot = await listingRef.get();
  const listing = listingSnapshot.data();

  if (!listingSnapshot.exists || listing?.businessId !== businessId) {
    return { error: jsonError("Listing was not found for this business.", 404) };
  }

  return { db: verified.db, listing, listingRef, token: verified.token };
}

export async function GET(request: Request): Promise<Response> {
  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in as a business owner to load listings.", 401);

  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Live partner tools are not connected yet.", 503);

  const snapshot = await db.collection("listings").where("ownerIds", "array-contains", token.uid).get();
  const listings = snapshot.docs
    .map((listingDoc): DocumentData & { id: string } => ({ id: listingDoc.id, ...listingDoc.data() }))
    .sort((left, right) => {
      const leftMillis = typeof left.updatedAt?.toMillis === "function" ? left.updatedAt.toMillis() : 0;
      const rightMillis = typeof right.updatedAt?.toMillis === "function" ? right.updatedAt.toMillis() : 0;
      return rightMillis - leftMillis;
    })
    .slice(0, 100);

  return jsonOk({ listings });
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const businessId = clean(body?.businessId, 140);
  const listingId = clean(body?.listingId, 140);
  const saveMode = clean(body?.saveMode, 40) === "draft" ? "draft" : "submit";

  if (!businessId) return jsonError("Choose a business before saving a deal.", 400);

  const verified = await verifyOwnedBusiness(request, businessId);
  if ("error" in verified) return verified.error;

  const { business, db, token } = verified;
  if (!db || !business) return jsonError("Could not verify this business.", 503);

  const title = clean(body?.title, 120);
  const shortDescription = clean(body?.shortDescription, 180);
  const description = clean(body?.description, 1600);
  const categoryIds = cleanStringArray(body?.categoryIds, 4, 80);
  const price = cleanNumber(body?.price, 0, 10000, 0);
  const originalPrice = cleanNullableNumber(body?.originalPrice, 0, 10000);
  const availableSlot = clean(body?.availableSlot, 80);
  const availableSlots = availableSlot ? [availableSlot] : cleanStringArray(body?.availableSlots, 8, 80);
  const availableDays = normalizeAvailableDays(cleanStringArray(body?.availableDays, 7, 24), availableSlots);

  if (!title || !shortDescription || !description || !categoryIds.length || !availableSlots.length) {
    return jsonError("Add title, category, descriptions, price, and at least one available time.", 400);
  }

  if (originalPrice !== null && originalPrice <= price) {
    return jsonError("Original price must be greater than the deal price, or left blank.", 400);
  }

  const listingRef = listingId ? db.collection("listings").doc(listingId) : db.collection("listings").doc();
  const existingSnapshot = listingId ? await listingRef.get() : null;
  const existing = existingSnapshot?.data();

  if (listingId) {
    const existingBusinessId = typeof existing?.businessId === "string" ? existing.businessId : "";
    if (!existingSnapshot?.exists || existingBusinessId !== businessId) {
      return jsonError("Listing was not found for this business.", 404);
    }
  }

  if (isLimitedListingStatus(saveMode === "draft" ? "draft" : "pending_approval") && !isLimitedListingStatus(String(existing?.status ?? ""))) {
    const limitError = await assertCanUseLimitedListingSlot(db, businessId, business, listingId || undefined);
    if (limitError) return limitError;
  }

  const status = saveMode === "draft" ? "draft" : "pending_approval";
  const businessCityId = clean(business.cityId, 100) || "coming-soon";
  const citySnapshot = businessCityId ? await db.collection("cities").doc(businessCityId).get() : null;
  const cityData = citySnapshot?.exists ? citySnapshot.data() : null;
  const cityId = businessCityId;
  const cityName = cityData ? clean(cityData.name, 120) : clean(business.cityName, 120) || titleizeSlug(cityId);
  const slug = `${slugify(title) || "last-minute-deal"}-${listingRef.id.slice(0, 6)}`;
  const now = FieldValue.serverTimestamp();
  const reviewResult = saveMode === "submit"
    ? await reviewListingWithAi({
        input: listingReviewInputFromRecord({
          availableSlot: availableSlots[0],
          categoryIds,
          cityName,
          description,
          originalPrice,
          price,
          remainingSpots: body?.remainingSpots,
          shortDescription,
          title
        }),
        scopeKey: token.uid
      })
    : null;

  if (reviewResult && (reviewResult.review.status === "needs_changes" || reviewResult.review.status === "rejected")) {
    return jsonError("Fix the listing review issues before submitting it for admin approval.", 422, {
      aiReview: reviewResult.review,
      provider: reviewResult.provider,
      setupWarning: reviewResult.setupWarning
    });
  }

  await listingRef.set(
    {
      ...(reviewResult
        ? {
            aiReview: {
              ...reviewResult.review,
              provider: reviewResult.provider,
              reviewedAt: now,
              version: 1
            }
          }
        : {}),
      approvalStatus: "pending",
      availableDays,
      availableFrom: cleanNullable(body?.availableFrom, 40),
      availableSlots,
      availableUntil: cleanNullable(body?.availableUntil, 40),
      bookingMode: clean(body?.bookingMode, 40) === "external_link" ? "external_link" : "request",
      bookingUrl: cleanNullable(body?.bookingUrl, 500),
      budgetTier: budgetTierForPrice(price),
      businessId,
      businessName: String(business.name ?? "Local partner"),
      cancellationNote: clean(body?.cancellationNote, 500) || "Availability is confirmed after the business reviews your request.",
      capacity: cleanNullableNumber(body?.capacity, 1, 500),
      categoryIds,
      cityId,
      cityName,
      clickCount: existing?.clickCount ?? 0,
      currency: "USD",
      description,
      discountPercent: discountPercent(originalPrice, price),
      durationMinutes: Math.round(cleanNumber(body?.durationMinutes, 15, 720, 90)),
      email: cleanNullable(body?.email, 254) ?? String(business.email ?? ""),
      featured: false,
      groupSize: clean(body?.groupSize, 80) || "Up to 4 people",
      groupTypes: cleanEnumArray(body?.groupTypes, GROUP_TYPES, ["date", "friends"]),
      id: listingRef.id,
      images: cleanStringArray(body?.images, 8, 500),
      indoorOutdoor: INDOOR_OUTDOOR.has(clean(body?.indoorOutdoor, 40) as IndoorOutdoor) ? clean(body?.indoorOutdoor, 40) : "indoor",
      isDemo: false,
      listingType: LISTING_TYPES.has(clean(body?.listingType, 40) as ListingType) ? clean(body?.listingType, 40) : "deal",
      originalPrice,
      ownerIds: Array.isArray(business.ownerIds) ? business.ownerIds.map(String) : [token.uid],
      phone: cleanNullable(body?.phone, 80) ?? (typeof business.phone === "string" ? business.phone : null),
      price,
      promoted: false,
      remainingSpots: cleanNullableNumber(body?.remainingSpots, 0, 500),
      requestCount: existing?.requestCount ?? 0,
      saveCount: existing?.saveCount ?? 0,
      shortDescription,
      slug: listingId && typeof existing?.slug === "string" ? existing.slug : slug,
      status,
      terms: clean(body?.terms, 700) || "Deal is subject to partner confirmation, capacity, and posted terms.",
      title,
      updatedAt: now,
      vibeTags: cleanEnumArray(body?.vibeTags, VIBES, ["social"]),
      viewCount: existing?.viewCount ?? 0,
      whyItFits: clean(body?.whyItFits, 500) || "A simple last-minute activity deal with open availability."
    },
    { merge: true }
  );

  if (!listingId) {
    await listingRef.set({ createdAt: now }, { merge: true });
  }

  return jsonOk({ listingId: listingRef.id, status }, listingId ? 200 : 201);
}

export async function PATCH(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const businessId = clean(body?.businessId, 140);
  const listingId = clean(body?.listingId, 140);
  const action = clean(body?.action, 40);

  if (!businessId) return jsonError("Choose a business before updating a listing.", 400);

  const verified = await verifyOwnedListing(request, businessId, listingId);
  if ("error" in verified) return verified.error;

  const now = FieldValue.serverTimestamp();

  if (action === "pause") {
    await verified.listingRef.set({ status: "paused", updatedAt: now }, { merge: true });
    return jsonOk({ listingId, status: "paused" });
  }

  if (action === "draft") {
    if (!isLimitedListingStatus(String(verified.listing.status ?? ""))) {
      const businessSnapshot = await verified.db.collection("businesses").doc(businessId).get();
      const limitError = await assertCanUseLimitedListingSlot(verified.db, businessId, businessSnapshot.data() ?? {}, listingId);
      if (limitError) return limitError;
    }

    await verified.listingRef.set({ status: "draft", updatedAt: now }, { merge: true });
    return jsonOk({ listingId, status: "draft" });
  }

  if (action === "submit") {
    if (!isLimitedListingStatus(String(verified.listing.status ?? ""))) {
      const businessSnapshot = await verified.db.collection("businesses").doc(businessId).get();
      const limitError = await assertCanUseLimitedListingSlot(verified.db, businessId, businessSnapshot.data() ?? {}, listingId);
      if (limitError) return limitError;
    }

    const reviewResult = await reviewListingWithAi({
      input: listingReviewInputFromRecord(verified.listing as Record<string, unknown>),
      scopeKey: verified.token.uid
    });

    if (reviewResult.review.status === "needs_changes" || reviewResult.review.status === "rejected") {
      return jsonError("Fix the listing review issues before submitting it for admin approval.", 422, {
        aiReview: reviewResult.review,
        provider: reviewResult.provider,
        setupWarning: reviewResult.setupWarning
      });
    }

    await verified.listingRef.set(
      {
        approvalStatus: "pending",
        aiReview: {
          ...reviewResult.review,
          provider: reviewResult.provider,
          reviewedAt: now,
          version: 1
        },
        featured: false,
        promoted: false,
        status: "pending_approval",
        updatedAt: now
      },
      { merge: true }
    );
    return jsonOk({ listingId, status: "pending_approval" });
  }

  if (action === "expire") {
    await verified.listingRef.set({ status: "expired", updatedAt: now }, { merge: true });
    return jsonOk({ listingId, status: "expired" });
  }

  return jsonError("Use a valid listing action: submit, pause, draft, or expire.", 400);
}

export async function DELETE(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const businessId = clean(body?.businessId, 140);
  const listingId = clean(body?.listingId, 140);

  if (!businessId) return jsonError("Choose a business before deleting a listing.", 400);

  const verified = await verifyOwnedListing(request, businessId, listingId);
  if ("error" in verified) return verified.error;

  if (verified.listing.status === "published") {
    return jsonError("Published listings should be paused or expired instead of deleted.", 400);
  }

  await verified.listingRef.delete();
  return jsonOk({ deleted: true, listingId });
}

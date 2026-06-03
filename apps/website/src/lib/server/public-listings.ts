import { demoListings } from "../demoData";
import { getBusinessById, getListingBySlug, getPublishedListings } from "../search";
import { getFirebaseAdminDb } from "./firebase-admin";
import type { DocumentData } from "firebase-admin/firestore";
import type { Business, Listing } from "../../types/deals";

function serializeListing(id: string, data: DocumentData): Listing {
  return {
    approvalStatus: data.approvalStatus === "approved" ? "approved" : data.approvalStatus === "rejected" ? "rejected" : "pending",
    availableDays: Array.isArray(data.availableDays) ? data.availableDays.map(String) : [],
    availableFrom: typeof data.availableFrom === "string" ? data.availableFrom : null,
    availableSlots: Array.isArray(data.availableSlots) ? data.availableSlots.map(String) : [],
    availableUntil: typeof data.availableUntil === "string" ? data.availableUntil : null,
    bookingMode: data.bookingMode === "external_link" || data.bookingMode === "phone" ? data.bookingMode : "request",
    bookingUrl: typeof data.bookingUrl === "string" ? data.bookingUrl : null,
    budgetTier: data.budgetTier === "free" || data.budgetTier === "under25" || data.budgetTier === "under50" || data.budgetTier === "under100" || data.budgetTier === "premium" ? data.budgetTier : "under50",
    businessId: String(data.businessId ?? ""),
    businessName: String(data.businessName ?? "Local partner"),
    cancellationNote: String(data.cancellationNote ?? "Availability is confirmed after the business reviews your request."),
    capacity: typeof data.capacity === "number" ? data.capacity : null,
    categoryIds: Array.isArray(data.categoryIds) ? data.categoryIds.map(String) : [],
    cityId: String(data.cityId ?? ""),
    cityName: String(data.cityName ?? "Local city"),
    clickCount: typeof data.clickCount === "number" ? data.clickCount : 0,
    currency: "USD",
    description: String(data.description ?? data.shortDescription ?? ""),
    discountPercent: typeof data.discountPercent === "number" ? data.discountPercent : null,
    durationMinutes: typeof data.durationMinutes === "number" ? data.durationMinutes : 90,
    email: typeof data.email === "string" ? data.email : null,
    featured: data.featured === true,
    groupSize: String(data.groupSize ?? "2-6"),
    groupTypes: Array.isArray(data.groupTypes) ? data.groupTypes.map(String).filter((item) => ["solo", "date", "friends", "family", "kids"].includes(item)) as Listing["groupTypes"] : ["date", "friends"],
    id: String(data.id ?? id),
    images: Array.isArray(data.images) ? data.images.map(String) : [],
    indoorOutdoor: data.indoorOutdoor === "outdoor" || data.indoorOutdoor === "either" ? data.indoorOutdoor : "indoor",
    isDemo: data.isDemo === true,
    listingType: data.listingType === "activity" || data.listingType === "event" || data.listingType === "class" || data.listingType === "experience" ? data.listingType : "deal",
    originalPrice: typeof data.originalPrice === "number" ? data.originalPrice : null,
    ownerIds: Array.isArray(data.ownerIds) ? data.ownerIds.map(String) : [],
    phone: typeof data.phone === "string" ? data.phone : null,
    price: typeof data.price === "number" ? data.price : 0,
    promoted: data.promoted === true,
    remainingSpots: typeof data.remainingSpots === "number" ? data.remainingSpots : null,
    requestCount: typeof data.requestCount === "number" ? data.requestCount : 0,
    saveCount: typeof data.saveCount === "number" ? data.saveCount : 0,
    shortDescription: String(data.shortDescription ?? ""),
    slug: String(data.slug ?? id),
    status: data.status === "published" ? "published" : "draft",
    terms: String(data.terms ?? "Deal is subject to partner confirmation, capacity, and posted terms."),
    title: String(data.title ?? "Local activity deal"),
    vibeTags: Array.isArray(data.vibeTags) ? data.vibeTags.map(String).filter((item) => ["chill", "romantic", "active", "social", "creative", "family-friendly", "adventurous", "low-energy", "rainy-day", "surprise-me"].includes(item)) as Listing["vibeTags"] : ["social"],
    viewCount: typeof data.viewCount === "number" ? data.viewCount : 0,
    whyItFits: String(data.whyItFits ?? "A simple last-minute activity deal with open availability.")
  };
}

export async function getPublicListingsForServer(): Promise<Listing[]> {
  const db = getFirebaseAdminDb();
  if (!db) return getPublishedListings();

  const snapshot = await db.collection("listings").where("status", "==", "published").where("approvalStatus", "==", "approved").get();
  const listings = snapshot.docs.map((listingDoc) => serializeListing(listingDoc.id, listingDoc.data()));
  return listings.length ? listings : demoListings;
}

export async function getPublicListingBySlugForServer(slug: string): Promise<Listing | undefined> {
  const db = getFirebaseAdminDb();
  if (!db) return getListingBySlug(slug);

  const snapshot = await db
    .collection("listings")
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .where("approvalStatus", "==", "approved")
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const listingDoc = snapshot.docs[0];
    return serializeListing(listingDoc.id, listingDoc.data());
  }

  return getListingBySlug(slug);
}

export async function getPublicListingByIdForServer(listingId: string): Promise<Listing | undefined> {
  const db = getFirebaseAdminDb();
  if (!db) return getPublishedListings().find((listing) => listing.id === listingId);

  const snapshot = await db.collection("listings").doc(listingId).get();
  const data = snapshot.data();

  if (snapshot.exists && data?.status === "published" && data.approvalStatus === "approved") {
    return serializeListing(snapshot.id, data);
  }

  return getPublishedListings().find((listing) => listing.id === listingId);
}

export async function getPublicListingByIdOrSlugForServer({
  listingId,
  listingSlug
}: {
  listingId?: string;
  listingSlug?: string;
}): Promise<Listing | undefined> {
  if (listingId) {
    const listing = await getPublicListingByIdForServer(listingId);
    if (listing) return listing;
  }

  if (listingSlug) return getPublicListingBySlugForServer(listingSlug);
  return undefined;
}

export async function getPublicBusinessForServer(businessId: string): Promise<Business | undefined> {
  const db = getFirebaseAdminDb();
  if (!db) return getBusinessById(businessId);

  const snapshot = await db.collection("businesses").doc(businessId).get();
  const data = snapshot.data();
  if (!snapshot.exists || data?.status !== "approved") return getBusinessById(businessId);

  return { id: snapshot.id, ...data } as Business;
}

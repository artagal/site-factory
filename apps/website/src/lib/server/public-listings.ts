import { demoListings } from "../demoData";
import { isDemoDataEnabled } from "../demo-mode";
import { normalizeBusinessDocument, normalizeListingDocument } from "../firestore-model";
import { getBusinessById, getListingBySlug, getPublishedListings } from "../search";
import { getFirebaseAdminDb } from "./firebase-admin";
import type { Business, Listing } from "../../types/deals";

export async function getPublicListingsForServer(): Promise<Listing[]> {
  const db = getFirebaseAdminDb();
  if (!db) return getPublishedListings();

  const snapshot = await db.collection("listings").where("status", "==", "published").where("approvalStatus", "==", "approved").get();
  const listings = snapshot.docs
    .map((listingDoc) => normalizeListingDocument(listingDoc.id, listingDoc.data()))
    .filter((listing) => !listing.isDemo);
  return listings.length ? listings : isDemoDataEnabled() ? demoListings : [];
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
    const listing = normalizeListingDocument(listingDoc.id, listingDoc.data());
    if (!listing.isDemo) return listing;
  }

  return isDemoDataEnabled() ? getListingBySlug(slug) : undefined;
}

export async function getPublicListingByIdForServer(listingId: string): Promise<Listing | undefined> {
  const db = getFirebaseAdminDb();
  if (!db) return getPublishedListings().find((listing) => listing.id === listingId);

  const snapshot = await db.collection("listings").doc(listingId).get();
  const data = snapshot.data();

  if (snapshot.exists && data?.status === "published" && data.approvalStatus === "approved" && data.isDemo !== true) {
    return normalizeListingDocument(snapshot.id, data);
  }

  return isDemoDataEnabled() ? getPublishedListings().find((listing) => listing.id === listingId) : undefined;
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
  if (!snapshot.exists || data?.status !== "approved" || data.isDemo === true) {
    return isDemoDataEnabled() ? getBusinessById(businessId) : undefined;
  }

  return normalizeBusinessDocument(snapshot.id, data);
}

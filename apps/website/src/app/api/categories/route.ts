import { getCanonicalCategoryOptions } from "../../../lib/categories";
import { demoCategories } from "../../../lib/demoData";
import { jsonOk } from "../../../lib/server/api-response";
import { getFirebaseAdminDb } from "../../../lib/server/firebase-admin";
import type { Category } from "../../../types/deals";
import { normalizeListingDocument } from "../../../lib/firestore-model";
import { isOpenListing } from "../../../lib/listing-presentation";

export async function GET(): Promise<Response> {
  const db = getFirebaseAdminDb();
  if (!db) return jsonOk({ categories: getCanonicalCategoryOptions(demoCategories, []), source: "curated" });

  const snapshot = await db.collection("categories").get();
  const categories = snapshot.docs
    .map((categoryDoc) => ({ id: categoryDoc.id, ...categoryDoc.data() }) as Category)
    .filter((category) => category.active);
  const listingSnapshot = await db.collection("listings").where("status", "==", "published").where("approvalStatus", "==", "approved").get();
  const listings = listingSnapshot.docs.map((listingDoc) => normalizeListingDocument(listingDoc.id, listingDoc.data())).filter((listing) => !listing.isDemo && isOpenListing(listing));

  return jsonOk({
    categories: getCanonicalCategoryOptions(categories.length ? categories : demoCategories, listings),
    source: categories.length ? "firestore" : "curated"
  });
}

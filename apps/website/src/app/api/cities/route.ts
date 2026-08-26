import { getCanonicalCityOptions } from "../../../lib/cities";
import { demoCities } from "../../../lib/demoData";
import { jsonOk } from "../../../lib/server/api-response";
import { getFirebaseAdminDb } from "../../../lib/server/firebase-admin";
import type { City } from "../../../types/deals";
import { normalizeListingDocument } from "../../../lib/firestore-model";
import { isOpenListing } from "../../../lib/listing-presentation";

export async function GET(): Promise<Response> {
  const db = getFirebaseAdminDb();
  if (!db) {
    return jsonOk({
      cities: getCanonicalCityOptions(demoCities, []),
      source: "curated"
    });
  }

  const snapshot = await db.collection("cities").get();
  const cities = snapshot.docs
    .map((cityDoc) => ({ id: cityDoc.id, ...cityDoc.data() }) as City)
    .filter((city) => city.active || city.comingSoon);
  const listingSnapshot = await db.collection("listings").where("status", "==", "published").where("approvalStatus", "==", "approved").get();
  const listings = listingSnapshot.docs.map((listingDoc) => normalizeListingDocument(listingDoc.id, listingDoc.data())).filter((listing) => !listing.isDemo && isOpenListing(listing));

  return jsonOk({
    cities: getCanonicalCityOptions(cities.length ? cities : demoCities, listings),
    source: cities.length ? "firestore" : "curated"
  });
}

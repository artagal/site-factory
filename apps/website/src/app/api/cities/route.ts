import { getCanonicalCityOptions } from "../../../lib/cities";
import { demoCities } from "../../../lib/demoData";
import { jsonOk } from "../../../lib/server/api-response";
import { getFirebaseAdminDb } from "../../../lib/server/firebase-admin";
import type { City } from "../../../types/deals";

export async function GET(): Promise<Response> {
  const db = getFirebaseAdminDb();
  if (!db) return jsonOk({ cities: getCanonicalCityOptions(demoCities), source: "demo" });

  const snapshot = await db.collection("cities").get();
  const cities = snapshot.docs
    .map((cityDoc) => ({ id: cityDoc.id, ...cityDoc.data() }) as City)
    .filter((city) => city.active || city.comingSoon);

  return jsonOk({
    cities: getCanonicalCityOptions(cities.length ? cities : demoCities),
    source: cities.length ? "firestore" : "demo"
  });
}

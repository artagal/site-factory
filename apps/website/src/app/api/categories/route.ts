import { getCanonicalCategoryOptions } from "../../../lib/categories";
import { demoCategories } from "../../../lib/demoData";
import { jsonOk } from "../../../lib/server/api-response";
import { getFirebaseAdminDb } from "../../../lib/server/firebase-admin";
import type { Category } from "../../../types/deals";

export async function GET(): Promise<Response> {
  const db = getFirebaseAdminDb();
  if (!db) return jsonOk({ categories: getCanonicalCategoryOptions(demoCategories), source: "demo" });

  const snapshot = await db.collection("categories").get();
  const categories = snapshot.docs
    .map((categoryDoc) => ({ id: categoryDoc.id, ...categoryDoc.data() }) as Category)
    .filter((category) => category.active);

  return jsonOk({
    categories: getCanonicalCategoryOptions(categories.length ? categories : demoCategories),
    source: categories.length ? "firestore" : "demo"
  });
}

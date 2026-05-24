import { getFirebaseAdminDb, FieldValue } from "./firebase-admin";

export type GlobalStatField =
  | "activeCities"
  | "activeListings"
  | "bookingRequests"
  | "listingsViewed"
  | "loginClicks"
  | "partnerApplications"
  | "plansGenerated"
  | "waitlistSubmissions";

export async function incrementServerGlobalStats(fields: GlobalStatField[]) {
  const db = getFirebaseAdminDb();
  if (!db || fields.length === 0) return false;

  const updates = fields.reduce<Record<string, unknown>>(
    (next, field) => {
      next[field] = FieldValue.increment(1);
      return next;
    },
    {
      updatedAt: FieldValue.serverTimestamp()
    }
  );

  await db.collection("globalStats").doc("main").set(updates, { merge: true });
  return true;
}

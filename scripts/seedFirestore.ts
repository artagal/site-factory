import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { demoBusinesses, demoCategories, demoCities, demoListings } from "../apps/website/src/lib/demoData";

function readServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is required.");
  const parsed = JSON.parse(raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8")) as {
    client_email?: string;
    private_key?: string;
    project_id?: string;
  };

  if (!parsed.client_email || !parsed.private_key || !parsed.project_id) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is missing required service account fields.");
  }

  return {
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key,
    projectId: parsed.project_id
  };
}

async function main() {
  if (process.env.GOFUNMOTION_ALLOW_DEMO_SEED !== "true") {
    throw new Error("Set GOFUNMOTION_ALLOW_DEMO_SEED=true to seed demo data.");
  }

  const serviceAccount = readServiceAccount();
  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId
    });
  }

  const db = getFirestore();
  const batch = db.batch();
  const timestamp = FieldValue.serverTimestamp();

  demoCities.forEach((city) => {
    batch.set(db.collection("cities").doc(city.id), { ...city, createdAt: timestamp, updatedAt: timestamp }, { merge: true });
  });

  demoCategories.forEach((category) => {
    batch.set(db.collection("categories").doc(category.id), category, { merge: true });
  });

  demoBusinesses.forEach((business) => {
    batch.set(db.collection("businesses").doc(business.id), { ...business, createdAt: timestamp, updatedAt: timestamp }, { merge: true });
  });

  demoListings.forEach((listing) => {
    batch.set(
      db.collection("listings").doc(listing.id),
      {
        ...listing,
        clickCount: 0,
        createdAt: timestamp,
        requestCount: 0,
        saveCount: 0,
        updatedAt: timestamp,
        viewCount: 0
      },
      { merge: true }
    );
  });

  await batch.commit();
  console.log(`Seeded ${demoCities.length} cities, ${demoCategories.length} categories, ${demoBusinesses.length} businesses, and ${demoListings.length} listings.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseApp } from "./firebase";
import { normalizeBusinessDocument, normalizeCategoryDocument, normalizeCityDocument, normalizeListingDocument } from "./firestore-model";
import type { BookingRequest, Business, GoFunMotionUserProfile, Listing, PartnerApplication, SuggestedPlan } from "../types/deals";

const emulatorConnectedDb = new WeakSet<object>();

export type SavedListingRecord = {
  listingId: string;
  listingSnapshot: Listing;
  savedAt?: unknown;
};

export type SavedPlanRecord = {
  planId: string;
  planSnapshot: SuggestedPlan;
  savedAt?: unknown;
};

export type BookingRequestRecord = BookingRequest & {
  id: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type PartnerApplicationRecord = PartnerApplication & {
  approvedBusinessId?: string;
  approvedOwnerUid?: string;
  id: string;
  createdAt?: unknown;
  reviewedAt?: unknown;
  reviewedBy?: string;
  updatedAt?: unknown;
};

export type AdminAuditLogRecord = {
  action: string;
  actorUid: string;
  createdAt?: unknown;
  id: string;
  metadata?: Record<string, boolean | number | string | null>;
  targetId: string;
  targetType: "bookingRequest" | "business" | "category" | "city" | "listing" | "partnerApplication" | "user";
};

export function getGoFunMotionDb() {
  const app = getFirebaseApp();
  if (!app) return null;

  const db = getFirestore(app);
  const emulatorHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST;
  if (
    process.env.NODE_ENV !== "production"
    && emulatorHost
    && !emulatorConnectedDb.has(db)
  ) {
    const [host, portValue] = emulatorHost.split(":");
    const port = Number(portValue);
    if (host && Number.isInteger(port) && port > 0) {
      connectFirestoreEmulator(db, host, port);
      emulatorConnectedDb.add(db);
    }
  }

  return db;
}

export async function ensureUserProfile(user: User) {
  const db = getGoFunMotionDb();
  if (!db) return null;

  const profileRef = doc(db, "users", user.uid);
  const existingProfile = await getDoc(profileRef);
  const sharedFields = {
    displayName: user.displayName ?? "GoFunMotion user",
    email: user.email,
    isAnonymous: user.isAnonymous,
    lastLoginAt: serverTimestamp(),
    photoURL: user.photoURL,
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(profileRef, existingProfile.exists()
      ? sharedFields
      : {
        ...sharedFields,
        accountStatus: "active",
        createdAt: serverTimestamp(),
        phone: null,
        preferredCategories: [],
        preferredCityId: null,
        role: "user"
      },
      { merge: true }
    );
  } catch {
    const idToken = await user.getIdToken();
    const response = await fetch("/api/account/profile/sync", {
      headers: { Authorization: `Bearer ${idToken}` },
      method: "POST"
    });
    if (!response.ok) throw new Error("Could not synchronize your account profile.");
  }

  return user.uid;
}

export async function readUserProfile(userId: string): Promise<GoFunMotionUserProfile | null> {
  const db = getGoFunMotionDb();
  if (!db) return null;

  const snapshot = await getDoc(doc(db, "users", userId));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();

  return {
    displayName: String(data.displayName ?? "GoFunMotion user"),
    email: typeof data.email === "string" ? data.email : null,
    phone: typeof data.phone === "string" ? data.phone : null,
    photoURL: typeof data.photoURL === "string" ? data.photoURL : null,
    preferredCategories: Array.isArray(data.preferredCategories) ? data.preferredCategories.map(String) : [],
    preferredCityId: typeof data.preferredCityId === "string" ? data.preferredCityId : null,
    role: data.role === "business" ? "business" : "user"
  };
}

export async function saveListingForUser(userId: string, listing: Listing) {
  const db = getGoFunMotionDb();
  if (!db) return null;

  await setDoc(doc(db, "users", userId, "savedListings", listing.id), {
    listingId: listing.id,
    listingSnapshot: listing,
    savedAt: serverTimestamp()
  });

  return listing.id;
}

export async function unsaveListingForUser(userId: string, listingId: string) {
  const db = getGoFunMotionDb();
  if (!db) return null;
  await deleteDoc(doc(db, "users", userId, "savedListings", listingId));
  return listingId;
}

export async function savePlanForUser(userId: string, plan: SuggestedPlan) {
  const db = getGoFunMotionDb();
  if (!db) return null;

  await setDoc(doc(db, "users", userId, "savedPlans", plan.id), {
    planId: plan.id,
    planSnapshot: plan,
    savedAt: serverTimestamp()
  });

  return plan.id;
}

export async function readSavedListings(userId: string) {
  const db = getGoFunMotionDb();
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "users", userId, "savedListings"));
  return snapshot.docs.map((savedDoc) => savedDoc.data() as SavedListingRecord);
}

export async function readSavedPlans(userId: string) {
  const db = getGoFunMotionDb();
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "users", userId, "savedPlans"));
  return snapshot.docs.map((savedDoc) => savedDoc.data() as SavedPlanRecord);
}

export async function readUserBookingRequests(userId: string) {
  const db = getGoFunMotionDb();
  if (!db) return [];
  const snapshot = await getDocs(query(collection(db, "bookingRequests"), where("userId", "==", userId)));
  return snapshot.docs.map((requestDoc) => ({ id: requestDoc.id, ...requestDoc.data() }) as BookingRequestRecord);
}

export async function createBookingRequest(request: BookingRequest) {
  const db = getGoFunMotionDb();
  if (!db) return null;

  return addDoc(collection(db, "bookingRequests"), {
    ...request,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function createPartnerApplication(application: PartnerApplication) {
  const db = getGoFunMotionDb();
  if (!db) return null;

  return addDoc(collection(db, "partnerApplications"), {
    ...application,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function isAdminUser(userId: string) {
  const db = getGoFunMotionDb();
  if (!db) return false;
  const snapshot = await getDoc(doc(db, "admins", userId));
  return snapshot.exists();
}

export async function readAdminPartnerApplications() {
  const db = getGoFunMotionDb();
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "partnerApplications"));
  return snapshot.docs.map((applicationDoc) => ({ id: applicationDoc.id, ...applicationDoc.data() }) as PartnerApplicationRecord);
}

export async function readAdminBusinesses() {
  const db = getGoFunMotionDb();
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "businesses"));
  return snapshot.docs.map((businessDoc) => normalizeBusinessDocument(businessDoc.id, businessDoc.data()));
}

export async function readAdminCities() {
  const db = getGoFunMotionDb();
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "cities"));
  return snapshot.docs.map((cityDoc) => normalizeCityDocument(cityDoc.id, cityDoc.data()));
}

export async function readAdminCategories() {
  const db = getGoFunMotionDb();
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map((categoryDoc) => normalizeCategoryDocument(categoryDoc.id, categoryDoc.data()));
}

export async function readAdminListings() {
  const db = getGoFunMotionDb();
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "listings"));
  return snapshot.docs.map((listingDoc) => normalizeListingDocument(listingDoc.id, listingDoc.data()));
}

export async function readAdminBookingRequests() {
  const db = getGoFunMotionDb();
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "bookingRequests"));
  return snapshot.docs.map((requestDoc) => ({ id: requestDoc.id, ...requestDoc.data() }) as BookingRequestRecord);
}

export async function readAdminAuditLogs() {
  const db = getGoFunMotionDb();
  if (!db) return [];
  const snapshot = await getDocs(query(collection(db, "adminAuditLogs"), orderBy("createdAt", "desc"), limit(30)));
  return snapshot.docs.map((auditDoc) => ({ id: auditDoc.id, ...auditDoc.data() }) as AdminAuditLogRecord);
}

export async function readBusinessesForOwner(userId: string) {
  const db = getGoFunMotionDb();
  if (!db) return [];
  const snapshot = await getDocs(query(collection(db, "businesses"), where("ownerIds", "array-contains", userId)));
  return snapshot.docs.map((businessDoc) => normalizeBusinessDocument(businessDoc.id, businessDoc.data()));
}

export async function readListingsForBusiness(businessId: string) {
  const db = getGoFunMotionDb();
  if (!db) return [];
  const snapshot = await getDocs(query(collection(db, "listings"), where("businessId", "==", businessId)));
  return snapshot.docs.map((listingDoc) => normalizeListingDocument(listingDoc.id, listingDoc.data()));
}

export async function readBookingRequestsForBusiness(businessId: string) {
  const db = getGoFunMotionDb();
  if (!db) return [];
  const snapshot = await getDocs(query(collection(db, "bookingRequests"), where("businessId", "==", businessId)));
  return snapshot.docs.map((requestDoc) => ({ id: requestDoc.id, ...requestDoc.data() }) as BookingRequestRecord);
}

export async function addMarketplaceWaitlistEntry({
  city,
  email,
  interestType,
  source = "website"
}: {
  city: string | null;
  email: string;
  interestType: "user" | "business";
  source?: string;
}) {
  const db = getGoFunMotionDb();
  if (!db) return null;

  return addDoc(collection(db, "waitlist"), {
    city,
    createdAt: serverTimestamp(),
    email,
    interestType,
    source
  });
}

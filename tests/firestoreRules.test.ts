import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment
} from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { doc, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const hasFirestoreEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const describeWithEmulator = hasFirestoreEmulator ? describe : describe.skip;

let testEnv: RulesTestEnvironment;

function city() {
  return {
    active: true,
    comingSoon: false,
    country: "US",
    name: "Austin",
    slug: "austin",
    state: "TX",
    timezone: "America/Chicago"
  };
}

function category() {
  return {
    active: true,
    name: "Comedy",
    slug: "comedy"
  };
}

function business(overrides: Record<string, unknown> = {}) {
  return {
    addressLine1: "",
    addressLine2: null,
    categories: ["comedy"],
    categoryNames: ["Comedy"],
    cityId: "austin",
    cityName: "Austin",
    country: "US",
    createdAt: Timestamp.now(),
    description: "Independent comedy venue with last-minute seats.",
    email: "partner@example.com",
    instagram: null,
    isDemo: false,
    latitude: null,
    logoUrl: null,
    longitude: null,
    name: "Test Comedy Club",
    ownerIds: ["owner-a"],
    paidAccessEnabled: false,
    phone: null,
    photos: [],
    postalCode: "",
    pricingTier: "starter",
    slug: "test-comedy-club",
    state: "TX",
    status: "approved",
    updatedAt: Timestamp.now(),
    verificationStatus: "unverified",
    website: null,
    ...overrides
  };
}

function listing(overrides: Record<string, unknown> = {}) {
  return {
    approvalStatus: "approved",
    availableDays: ["today", "tonight"],
    availableFrom: null,
    availableSlots: ["8:30 PM"],
    availableUntil: null,
    bookingMode: "request",
    bookingUrl: null,
    budgetTier: "under50",
    businessId: "business-a",
    businessName: "Test Comedy Club",
    cancellationNote: "Availability requires confirmation.",
    capacity: 20,
    categoryIds: ["comedy"],
    cityId: "austin",
    cityName: "Austin",
    clickCount: 0,
    createdAt: Timestamp.now(),
    currency: "USD",
    description: "Last-minute comedy tickets for tonight.",
    discountPercent: 50,
    durationMinutes: 90,
    email: "partner@example.com",
    featured: false,
    groupSize: "1-6",
    groupTypes: ["date", "friends"],
    id: "listing-a",
    images: [],
    indoorOutdoor: "indoor",
    isDemo: false,
    listingType: "event",
    originalPrice: 50,
    ownerIds: ["owner-a"],
    phone: null,
    price: 25,
    promoted: false,
    remainingSpots: 4,
    requestCount: 0,
    saveCount: 0,
    shortDescription: "Tonight-only comedy seats.",
    slug: "comedy-night-test",
    status: "published",
    terms: "Partner confirmation required.",
    title: "Comedy Night - 50% Off",
    updatedAt: Timestamp.now(),
    vibeTags: ["social"],
    viewCount: 0,
    whyItFits: "A clear plan for tonight.",
    ...overrides
  };
}

function bookingRequest(overrides: Record<string, unknown> = {}) {
  return {
    businessId: "business-a",
    businessName: "Test Comedy Club",
    businessOwnerIds: ["owner-a"],
    cityId: "austin",
    createdAt: serverTimestamp(),
    email: "customer@example.com",
    listingId: "listing-a",
    listingTitle: "Comedy Night - 50% Off",
    message: "Two seats if available.",
    name: "Customer A",
    partySize: 2,
    phone: null,
    requestedDate: "2026-08-24",
    requestedTime: "8:30 PM",
    status: "pending",
    updatedAt: serverTimestamp(),
    userId: "customer-a",
    ...overrides
  };
}

describeWithEmulator("GoFunMotion Deals Firestore rules", () => {
  beforeAll(async () => {
    const [host, portText] = process.env.FIRESTORE_EMULATOR_HOST!.split(":");
    testEnv = await initializeTestEnvironment({
      projectId: `gofunmotion-rules-${Date.now()}`,
      firestore: {
        host,
        port: Number(portText),
        rules: readFileSync(resolve(repoRoot, "firestore.rules"), "utf8")
      }
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  afterAll(async () => {
    await testEnv?.cleanup();
  });

  it("exposes only approved live listings and hides demos", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "listings", "listing-a"), listing());
      await setDoc(doc(db, "listings", "pending"), listing({ approvalStatus: "pending", status: "pending_approval" }));
      await setDoc(doc(db, "listings", "demo"), listing({ id: "demo", isDemo: true }));
    });

    const publicDb = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(publicDb, "listings", "listing-a")));
    await assertFails(getDoc(doc(publicDb, "listings", "pending")));
    await assertFails(getDoc(doc(publicDb, "listings", "demo")));
  });

  it("lets owners submit listings but blocks self-approval and city spoofing", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "cities", "austin"), city());
      await setDoc(doc(db, "businesses", "business-a"), business());
    });

    const ownerDb = testEnv.authenticatedContext("owner-a").firestore();
    await assertSucceeds(setDoc(doc(ownerDb, "listings", "draft"), listing({
      approvalStatus: "pending",
      id: "draft",
      status: "pending_approval"
    })));
    await assertFails(setDoc(doc(ownerDb, "listings", "self-approved"), listing({ id: "self-approved" })));
    await assertFails(setDoc(doc(ownerDb, "listings", "wrong-city"), listing({
      approvalStatus: "pending",
      cityId: "miami",
      id: "wrong-city",
      status: "pending_approval"
    })));
  });

  it("keeps profiles, saves, and push tokens scoped to their user", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "listings", "listing-a"), listing());
    });

    const userDb = testEnv.authenticatedContext("customer-a").firestore();
    const strangerDb = testEnv.authenticatedContext("stranger").firestore();
    await assertSucceeds(setDoc(doc(userDb, "users", "customer-a"), {
      accountStatus: "active",
      createdAt: serverTimestamp(),
      displayName: "Customer A",
      email: "customer@example.com",
      isAnonymous: false,
      lastLoginAt: serverTimestamp(),
      notificationPreferences: {},
      phone: null,
      photoURL: null,
      preferredCategories: [],
      preferredCityId: "austin",
      role: "user",
      updatedAt: serverTimestamp()
    }));
    await assertSucceeds(setDoc(doc(userDb, "users", "customer-a", "savedListings", "listing-a"), {
      listingId: "listing-a",
      listingSnapshot: { title: "Comedy Night - 50% Off" },
      savedAt: serverTimestamp()
    }));
    await assertFails(getDoc(doc(strangerDb, "users", "customer-a", "savedListings", "listing-a")));
    await assertSucceeds(setDoc(doc(userDb, "users", "customer-a", "deviceTokens", "ios-token"), {
      appVersion: "1.0.0",
      createdAt: serverTimestamp(),
      enabled: true,
      lastSeenAt: serverTimestamp(),
      locale: "en-US",
      platform: "ios",
      token: "test-device-token-with-more-than-twenty-characters",
      updatedAt: serverTimestamp()
    }));
    await assertFails(setDoc(doc(strangerDb, "users", "customer-a", "deviceTokens", "spoofed"), {
      appVersion: "1.0.0",
      createdAt: serverTimestamp(),
      enabled: true,
      lastSeenAt: serverTimestamp(),
      locale: "en-US",
      platform: "ios",
      token: "another-test-token-with-more-than-twenty-characters",
      updatedAt: serverTimestamp()
    }));
  });

  it("accepts valid booking requests and keeps updates behind the trusted API", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "businesses", "business-a"), business());
      await setDoc(doc(db, "listings", "listing-a"), listing());
    });

    const customerDb = testEnv.authenticatedContext("customer-a").firestore();
    const ownerDb = testEnv.authenticatedContext("owner-a").firestore();
    const strangerDb = testEnv.authenticatedContext("stranger").firestore();
    await assertSucceeds(setDoc(doc(customerDb, "bookingRequests", "request-a"), bookingRequest()));
    await assertFails(setDoc(doc(strangerDb, "bookingRequests", "spoofed"), bookingRequest()));
    await assertSucceeds(getDoc(doc(ownerDb, "bookingRequests", "request-a")));
    await assertFails(getDoc(doc(strangerDb, "bookingRequests", "request-a")));
    await assertFails(updateDoc(doc(ownerDb, "bookingRequests", "request-a"), {
      status: "confirmed",
      updatedAt: serverTimestamp()
    }));
  });

  it("allows admins to moderate while blocking owners from review fields", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "admins", "admin-a"), { role: "admin" });
      await setDoc(doc(db, "businesses", "business-a"), business());
      await setDoc(doc(db, "listings", "pending"), listing({ approvalStatus: "pending", id: "pending", status: "pending_approval" }));
    });

    const adminDb = testEnv.authenticatedContext("admin-a").firestore();
    const ownerDb = testEnv.authenticatedContext("owner-a").firestore();
    await assertSucceeds(updateDoc(doc(adminDb, "listings", "pending"), {
      approvalStatus: "approved",
      status: "published"
    }));
    await assertFails(updateDoc(doc(ownerDb, "listings", "pending"), {
      approvalStatus: "approved",
      status: "published"
    }));
  });

  it("allows canonical partner applications only for known city/category IDs", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "cities", "austin"), city());
      await setDoc(doc(db, "categories", "comedy"), category());
    });

    const publicDb = testEnv.unauthenticatedContext().firestore();
    const application = {
      averagePrice: "$25",
      businessName: "Test Comedy Club",
      category: "Comedy",
      categoryId: "comedy",
      categoryName: "Comedy",
      city: "Austin, TX",
      cityId: "austin",
      cityName: "Austin",
      createdAt: serverTimestamp(),
      description: "A local comedy venue with unused same-day seats.",
      email: "partner@example.com",
      instagram: null,
      message: "",
      offersLastMinuteDeals: true,
      ownerName: "Owner A",
      phone: null,
      status: "new",
      updatedAt: serverTimestamp(),
      website: null
    };
    await assertSucceeds(setDoc(doc(publicDb, "partnerApplications", "application-a"), application));
    await assertFails(setDoc(doc(publicDb, "partnerApplications", "unknown-city"), {
      ...application,
      cityId: "unknown"
    }));
  });

  it("keeps Stripe identifiers and webhook idempotency records server-only", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "admins", "admin-a"), { role: "admin" });
      await setDoc(doc(db, "businessBilling", "business-a"), {
        stripeCustomerId: "cus_test",
        stripeSubscriptionId: "sub_test"
      });
      await setDoc(doc(db, "stripeWebhookEvents", "evt_test"), {
        businessId: "business-a",
        eventType: "customer.subscription.updated"
      });
    });

    for (const db of [
      testEnv.unauthenticatedContext().firestore(),
      testEnv.authenticatedContext("owner-a").firestore(),
      testEnv.authenticatedContext("admin-a").firestore()
    ]) {
      await assertFails(getDoc(doc(db, "businessBilling", "business-a")));
      await assertFails(getDoc(doc(db, "stripeWebhookEvents", "evt_test")));
      await assertFails(setDoc(doc(db, "businessBilling", "spoofed"), { stripeCustomerId: "cus_spoofed" }));
    }
  });

  it("denies the retired challenge-era/BeautyDrop collection model", async () => {
    const ownerDb = testEnv.authenticatedContext("owner-a").firestore();
    await assertFails(setDoc(doc(ownerDb, "drops", "legacy"), { status: "active" }));
    await assertFails(setDoc(doc(ownerDb, "booking_requests", "legacy"), { status: "pending" }));
    await assertFails(setDoc(doc(ownerDb, "favorites", "legacy"), { userId: "owner-a" }));
    await assertFails(setDoc(doc(ownerDb, "savedListings", "legacy"), { userId: "owner-a" }));
  });
});

if (!hasFirestoreEmulator) {
  describe("GoFunMotion Deals Firestore rules", () => {
    it("skips emulator smoke tests unless FIRESTORE_EMULATOR_HOST is set", () => {
      expect(hasFirestoreEmulator).toBe(false);
    });
  });
}

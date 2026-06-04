import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment
} from "@firebase/rules-unit-testing";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc
} from "firebase/firestore";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const hasFirestoreEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const describeWithEmulator = hasFirestoreEmulator ? describe : describe.skip;

let testEnv: RulesTestEnvironment;

const future = Timestamp.fromDate(new Date(Date.now() + 60 * 60 * 1000));
const past = Timestamp.fromDate(new Date(Date.now() - 60 * 60 * 1000));
const startAt = Timestamp.fromDate(new Date(Date.now() + 15 * 60 * 1000));
const endAt = Timestamp.fromDate(new Date(Date.now() + 75 * 60 * 1000));

function drop(overrides: Record<string, unknown> = {}) {
  return {
    capacity: 8,
    category: "comedy",
    city: "Austin",
    confirmationMode: "request_to_confirm",
    createdAt: Timestamp.now(),
    dealPrice: 22,
    description: "Last-minute comedy table opening.",
    endAt,
    expiresAt: future,
    locationFormatted: "Downtown Austin",
    moderationStatus: "approved",
    providerId: "provider-a",
    regularPrice: 35,
    spotsRemaining: 4,
    startAt,
    status: "active",
    title: "Comedy night seats",
    updatedAt: Timestamp.now(),
    ...overrides
  };
}

function bookingRequest(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: Timestamp.now(),
    customerEmail: "customer@example.com",
    customerId: "customer-a",
    customerName: "Customer A",
    customerPhone: "555-0100",
    dropId: "drop-a",
    message: "Two seats if available.",
    partySize: 2,
    providerId: "provider-a",
    status: "pending",
    updatedAt: Timestamp.now(),
    ...overrides
  };
}

describeWithEmulator("GoFunMotion Firestore rules", () => {
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

  it("allows public reads only for approved active available drops", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "drops", "drop-a"), drop());
      await setDoc(doc(db, "drops", "draft-drop"), drop({ moderationStatus: "pending_review" }));
      await setDoc(doc(db, "drops", "expired-drop"), drop({ expiresAt: past }));
    });

    const publicDb = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(getDoc(doc(publicDb, "drops", "drop-a")));
    await assertFails(getDoc(doc(publicDb, "drops", "draft-drop")));
    await assertFails(getDoc(doc(publicDb, "drops", "expired-drop")));
  });

  it("lets providers create drops but blocks self-approval", async () => {
    const providerDb = testEnv.authenticatedContext("provider-a").firestore();

    await assertSucceeds(setDoc(doc(providerDb, "drops", "draft-drop"), drop({
      moderationStatus: "pending_review",
      providerId: "provider-a",
      status: "draft"
    })));

    await assertFails(setDoc(doc(providerDb, "drops", "self-approved"), drop({
      moderationStatus: "approved",
      providerId: "provider-a",
      status: "active"
    })));
  });

  it("allows booking requests only from the customer against approved active drops", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "drops", "drop-a"), drop());
      await setDoc(doc(db, "drops", "pending-drop"), drop({
        moderationStatus: "pending_review",
        providerId: "provider-a"
      }));
    });

    const customerDb = testEnv.authenticatedContext("customer-a").firestore();
    const otherCustomerDb = testEnv.authenticatedContext("customer-b").firestore();

    await assertSucceeds(setDoc(doc(customerDb, "booking_requests", "request-a"), bookingRequest()));
    await assertFails(setDoc(doc(otherCustomerDb, "booking_requests", "spoofed-request"), bookingRequest()));
    await assertFails(setDoc(doc(customerDb, "booking_requests", "pending-drop-request"), bookingRequest({
      dropId: "pending-drop"
    })));
  });

  it("keeps booking request reads and status updates scoped to participants", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "booking_requests", "request-a"), bookingRequest());
    });

    const customerDb = testEnv.authenticatedContext("customer-a").firestore();
    const providerDb = testEnv.authenticatedContext("provider-a").firestore();
    const strangerDb = testEnv.authenticatedContext("stranger").firestore();

    await assertSucceeds(getDoc(doc(customerDb, "booking_requests", "request-a")));
    await assertSucceeds(getDoc(doc(providerDb, "booking_requests", "request-a")));
    await assertFails(getDoc(doc(strangerDb, "booking_requests", "request-a")));

    await assertSucceeds(updateDoc(doc(providerDb, "booking_requests", "request-a"), {
      acceptedAt: Timestamp.now(),
      status: "accepted",
      updatedAt: Timestamp.now()
    }));
    await assertFails(updateDoc(doc(strangerDb, "booking_requests", "request-a"), {
      status: "declined",
      updatedAt: Timestamp.now()
    }));
  });

  it("keeps favorites and device tokens user-owned", async () => {
    const customerDb = testEnv.authenticatedContext("customer-a").firestore();
    const strangerDb = testEnv.authenticatedContext("stranger").firestore();

    await assertSucceeds(setDoc(doc(customerDb, "favorites", "customer-a_drop-a"), {
      createdAt: Timestamp.now(),
      dropId: "drop-a",
      id: "customer-a_drop-a",
      userId: "customer-a"
    }));
    await assertFails(getDoc(doc(strangerDb, "favorites", "customer-a_drop-a")));
    await assertFails(deleteDoc(doc(strangerDb, "favorites", "customer-a_drop-a")));

    await assertSucceeds(setDoc(doc(customerDb, "device_tokens", "customer-a_ios_token"), {
      createdAt: Timestamp.now(),
      id: "customer-a_ios_token",
      isActive: true,
      lastSeenAt: Timestamp.now(),
      platform: "ios",
      token: "fake-token",
      userId: "customer-a"
    }));
    await assertFails(setDoc(doc(strangerDb, "device_tokens", "spoofed-token"), {
      createdAt: Timestamp.now(),
      id: "spoofed-token",
      isActive: true,
      lastSeenAt: Timestamp.now(),
      platform: "ios",
      token: "fake-token",
      userId: "customer-a"
    }));
  });

  it("allows reviews only after completed booking requests and keeps pending reviews private", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "booking_requests", "completed-request"), bookingRequest({
        status: "completed"
      }));
      await setDoc(doc(db, "booking_requests", "pending-request"), bookingRequest({
        status: "pending"
      }));
    });

    const customerDb = testEnv.authenticatedContext("customer-a").firestore();
    const publicDb = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(setDoc(doc(customerDb, "reviews", "completed-request"), {
      bookingRequestId: "completed-request",
      createdAt: Timestamp.now(),
      customerId: "customer-a",
      dropId: "drop-a",
      id: "completed-request",
      moderationStatus: "pending",
      providerId: "provider-a",
      rating: 5,
      tags: ["Fast response"],
      text: "Great night out.",
      updatedAt: Timestamp.now(),
      wouldBookAgain: true
    }));
    await assertFails(setDoc(doc(customerDb, "reviews", "pending-request"), {
      bookingRequestId: "pending-request",
      createdAt: Timestamp.now(),
      customerId: "customer-a",
      dropId: "drop-a",
      id: "pending-request",
      moderationStatus: "pending",
      providerId: "provider-a",
      rating: 5,
      text: "Too early.",
      updatedAt: Timestamp.now(),
      wouldBookAgain: true
    }));
    await assertFails(getDoc(doc(publicDb, "reviews", "completed-request")));
  });

  it("allows admin users to moderate and write audit records", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "admin_users", "admin-a"), {
        createdAt: Timestamp.now(),
        displayName: "Admin A",
        email: "admin@example.com",
        role: "admin",
        updatedAt: Timestamp.now()
      });
      await setDoc(doc(db, "drops", "drop-a"), drop({ moderationStatus: "pending_review" }));
    });

    const adminDb = testEnv.authenticatedContext("admin-a").firestore();
    const providerDb = testEnv.authenticatedContext("provider-a").firestore();

    await assertSucceeds(updateDoc(doc(adminDb, "drops", "drop-a"), {
      moderationStatus: "approved",
      status: "active",
      updatedAt: Timestamp.now()
    }));
    await assertSucceeds(setDoc(doc(adminDb, "admin_actions", "action-a"), {
      actionType: "approve_drop",
      adminId: "admin-a",
      createdAt: Timestamp.now(),
      reason: "Rules smoke test",
      targetId: "drop-a",
      targetType: "drop"
    }));
    await assertFails(setDoc(doc(providerDb, "admin_actions", "spoofed-action"), {
      actionType: "approve_drop",
      adminId: "provider-a",
      createdAt: Timestamp.now(),
      reason: "Not allowed",
      targetId: "drop-a",
      targetType: "drop"
    }));
  });
});

if (!hasFirestoreEmulator) {
  describe("GoFunMotion Firestore rules", () => {
    it("skips emulator smoke tests unless FIRESTORE_EMULATOR_HOST is set", () => {
      expect(hasFirestoreEmulator).toBe(false);
    });
  });
}

import { deleteApp, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, signInWithCustomToken } from "firebase/auth";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { POST as approvePartnerApplication } from "../apps/website/src/app/api/admin/partner-applications/approve/route";
import { POST as moderateListing } from "../apps/website/src/app/api/admin/listings/moderate/route";
import { POST as createBookingRequest } from "../apps/website/src/app/api/booking-request/route";
import { GET as getCustomerBookingRequests } from "../apps/website/src/app/api/me/booking-requests/route";
import { POST as saveListing } from "../apps/website/src/app/api/me/saved-listings/route";
import { POST as createPartnerApplication } from "../apps/website/src/app/api/partner-application/route";
import { GET as getPartnerBookingRequests } from "../apps/website/src/app/api/partner/booking-requests/route";
import { POST as updateBookingStatus } from "../apps/website/src/app/api/partner/booking-requests/status/route";
import { POST as createPartnerListing } from "../apps/website/src/app/api/partner/listings/route";
import { GET as searchListings } from "../apps/website/src/app/api/search/route";
import { getFirebaseAdminAuth, getFirebaseAdminDb } from "../apps/website/src/lib/server/firebase-admin";

const hasFirebaseEmulators = Boolean(
  process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST
);
const describeWithEmulators = hasFirebaseEmulators ? describe : describe.skip;

function jsonRequest(
  url: string,
  body: Record<string, unknown>,
  token?: string
) {
  return new Request(url, {
    body: JSON.stringify(body),
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      "content-type": "application/json",
      "x-forwarded-for": "127.0.0.42"
    },
    method: "POST"
  });
}

async function responseJson<T>(response: Response): Promise<T> {
  return await response.json() as T;
}

describeWithEmulators("GoFunMotion marketplace lifecycle", () => {
  const projectId = process.env.GCLOUD_PROJECT ?? "gofunmotion-marketplace-test";
  const clientApp = initializeApp({ apiKey: "demo-api-key", projectId }, `gofunmotion-flow-${Date.now()}`);
  const clientAuth = getAuth(clientApp);
  let adminToken = "";
  let customerToken = "";
  let ownerToken = "";
  let adminUid = "";
  let customerUid = "";
  let ownerUid = "";

  beforeAll(async () => {
    process.env.FIREBASE_PROJECT_ID = projectId;
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = projectId;
    delete process.env.OPENAI_API_KEY;
    delete process.env.RESEND_API_KEY;

    connectAuthEmulator(clientAuth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`, {
      disableWarnings: true
    });

    const adminAuth = getFirebaseAdminAuth();
    const db = getFirebaseAdminDb();
    if (!adminAuth || !db) throw new Error("Firebase emulators did not initialize.");
    const emulatorAuth = adminAuth;

    const [admin, owner, customer] = await Promise.all([
      emulatorAuth.createUser({ email: "admin-flow@gofunmotion.test", displayName: "Flow Admin" }),
      emulatorAuth.createUser({ email: "owner-flow@gofunmotion.test", displayName: "Flow Owner" }),
      emulatorAuth.createUser({ email: "customer-flow@gofunmotion.test", displayName: "Flow Customer" })
    ]);
    adminUid = admin.uid;
    ownerUid = owner.uid;
    customerUid = customer.uid;

    await Promise.all([
      db.collection("admins").doc(adminUid).set({ role: "admin" }),
      db.collection("cities").doc("austin").set({
        active: true,
        comingSoon: false,
        country: "US",
        name: "Austin",
        slug: "austin",
        state: "TX"
      }),
      db.collection("categories").doc("creative").set({
        active: true,
        name: "Creative",
        slug: "creative",
        sortOrder: 1
      })
    ]);

    async function idTokenFor(uid: string) {
      const customToken = await emulatorAuth.createCustomToken(uid);
      const credential = await signInWithCustomToken(clientAuth, customToken);
      return credential.user.getIdToken();
    }

    adminToken = await idTokenFor(adminUid);
    ownerToken = await idTokenFor(ownerUid);
    customerToken = await idTokenFor(customerUid);
  }, 30_000);

  afterAll(async () => {
    await deleteApp(clientApp);
  });

  it("runs application, approval, live deal, save, booking, and confirmation", async () => {
    const db = getFirebaseAdminDb();
    if (!db) throw new Error("Firestore emulator is unavailable.");

    const applicationResponse = await createPartnerApplication(jsonRequest(
      "https://gofunmotion.test/api/partner-application",
      {
        businessName: "Austin Creative Lab",
        categoryId: "creative",
        cityId: "austin",
        description: "A real test workspace for reviewed, last-minute creative activity deals.",
        email: "owner-flow@gofunmotion.test",
        offersLastMinuteDeals: true,
        ownerName: "Flow Owner"
      }
    ));
    const application = await responseJson<{ applicationId: string; synced: boolean }>(applicationResponse);
    expect(applicationResponse.status).toBe(201);
    expect(application.synced).toBe(true);

    const approvalResponse = await approvePartnerApplication(jsonRequest(
      "https://gofunmotion.test/api/admin/partner-applications/approve",
      { applicationId: application.applicationId, ownerUid, status: "approved" },
      adminToken
    ));
    const approval = await responseJson<{ businessId: string; status: string }>(approvalResponse);
    expect(approvalResponse.status).toBe(201);
    expect(approval.status).toBe("approved");

    const listingResponse = await createPartnerListing(jsonRequest(
      "https://gofunmotion.test/api/partner/listings",
      {
        availableSlot: "tonight 8:30 PM",
        bookingMode: "request",
        businessId: approval.businessId,
        categoryIds: ["creative"],
        description: "A ninety-minute guided pottery session with all materials included.",
        durationMinutes: 90,
        groupTypes: ["date", "friends"],
        indoorOutdoor: "indoor",
        originalPrice: 80,
        price: 39,
        remainingSpots: 2,
        saveMode: "submit",
        shortDescription: "Two open seats for a guided pottery session tonight.",
        title: "Pottery Night: Two Seats Left",
        vibeTags: ["creative", "romantic"]
      },
      ownerToken
    ));
    const listing = await responseJson<{ listingId: string; status: string }>(listingResponse);
    expect(listingResponse.status).toBe(201);
    expect(listing.status).toBe("pending_approval");

    const moderationResponse = await moderateListing(jsonRequest(
      "https://gofunmotion.test/api/admin/listings/moderate",
      { action: "approve", listingId: listing.listingId },
      adminToken
    ));
    expect(moderationResponse.status).toBe(200);

    const searchResponse = await searchListings(new Request(
      "https://gofunmotion.test/api/search?city=Austin&category=creative&when=tonight"
    ));
    const search = await responseJson<{ listings: Array<{ id: string; isDemo: boolean }> }>(searchResponse);
    expect(search.listings).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: listing.listingId, isDemo: false })
    ]));

    const saveResponse = await saveListing(jsonRequest(
      "https://gofunmotion.test/api/me/saved-listings",
      { listingId: listing.listingId },
      customerToken
    ));
    expect(saveResponse.status).toBe(201);

    const bookingResponse = await createBookingRequest(jsonRequest(
      "https://gofunmotion.test/api/booking-request",
      {
        email: "customer-flow@gofunmotion.test",
        listingId: listing.listingId,
        message: "Please confirm the two open seats.",
        name: "Flow Customer",
        partySize: 2,
        requestedDate: "2026-08-25",
        requestedTime: "20:30"
      },
      customerToken
    ));
    const booking = await responseJson<{ requestId: string; synced: boolean }>(bookingResponse);
    expect(bookingResponse.status).toBe(201);
    expect(booking.synced).toBe(true);

    const partnerRequestsResponse = await getPartnerBookingRequests(new Request(
      "https://gofunmotion.test/api/partner/booking-requests",
      { headers: { authorization: `Bearer ${ownerToken}` } }
    ));
    const partnerRequests = await responseJson<{ bookingRequests: Array<{ id: string; status: string }> }>(partnerRequestsResponse);
    expect(partnerRequests.bookingRequests).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: booking.requestId, status: "pending" })
    ]));

    const statusResponse = await updateBookingStatus(jsonRequest(
      "https://gofunmotion.test/api/partner/booking-requests/status",
      { requestId: booking.requestId, status: "confirmed" },
      ownerToken
    ));
    expect(statusResponse.status).toBe(200);

    const customerRequestsResponse = await getCustomerBookingRequests(new Request(
      "https://gofunmotion.test/api/me/booking-requests",
      { headers: { authorization: `Bearer ${customerToken}` } }
    ));
    const customerRequests = await responseJson<{ bookingRequests: Array<{ id: string; status: string }> }>(customerRequestsResponse);
    expect(customerRequests.bookingRequests).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: booking.requestId, status: "confirmed" })
    ]));

    const [auditLogs, customerNotifications, ownerNotifications, savedListing] = await Promise.all([
      db.collection("adminAuditLogs").get(),
      db.collection("users").doc(customerUid).collection("notifications").get(),
      db.collection("users").doc(ownerUid).collection("notifications").get(),
      db.collection("users").doc(customerUid).collection("savedListings").doc(listing.listingId).get()
    ]);
    expect(auditLogs.size).toBeGreaterThanOrEqual(2);
    expect(customerNotifications.size).toBeGreaterThanOrEqual(2);
    expect(ownerNotifications.size).toBeGreaterThanOrEqual(1);
    expect(savedListing.exists).toBe(true);
  }, 60_000);
});

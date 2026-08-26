import { deleteApp, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, signInWithCustomToken } from "firebase/auth";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET, POST } from "../apps/website/src/app/api/mobile/workspace/route";
import { POST as approveApplication } from "../apps/website/src/app/api/admin/partner-applications/approve/route";
import { getFirebaseAdminAuth, getFirebaseAdminDb } from "../apps/website/src/lib/server/firebase-admin";

const emulators = Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST);
const describeEmulated = emulators ? describe : describe.skip;

describeEmulated("Native workspace ownership and lifecycle", () => {
  const projectId = process.env.GCLOUD_PROJECT ?? "demo-gofunmotion-native";
  const app = initializeApp({ apiKey: "emulator-only", projectId }, `native-workspace-${Date.now()}`);
  const auth = getAuth(app);
  const tokens: Record<string, string> = {};
  const uids: Record<string, string> = {};
  const businessId = "native-workspace-business";
  const bookingId = "native-workspace-booking";
  const listingId = "native-workspace-listing";

  function write(body: Record<string, unknown>, role = "customer") {
    return POST(new Request("https://gofunmotion.test/api/mobile/workspace", {
      method: "POST", headers: { authorization: `Bearer ${tokens[role]}`, "content-type": "application/json" },
      body: JSON.stringify(body)
    }));
  }
  function read(section: string, role = "customer", id = "", business = "") {
    return GET(new Request(`https://gofunmotion.test/api/mobile/workspace?${new URLSearchParams({ section, id, businessId: business })}`, {
      headers: { authorization: `Bearer ${tokens[role]}` }
    }));
  }

  beforeAll(async () => {
    if (!projectId.startsWith("demo-") && !projectId.endsWith("-test")) throw new Error("Native integration tests require an emulator-only project.");
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.RESEND_API_KEY;
    delete process.env.OPENAI_API_KEY;
    process.env.FIREBASE_PROJECT_ID = projectId;
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = projectId;
    connectAuthEmulator(auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`, { disableWarnings: true });
    const adminAuth = getFirebaseAdminAuth()!;
    const db = getFirebaseAdminDb()!;
    for (const role of ["customer", "owner", "admin", "stranger"]) {
      const user = await adminAuth.createUser({ email: `native-${role}@gofunmotion.test`, displayName: role });
      uids[role] = user.uid;
      const credential = await signInWithCustomToken(auth, await adminAuth.createCustomToken(user.uid));
      tokens[role] = await credential.user.getIdToken();
      await db.collection("users").doc(user.uid).set({ displayName: role, role: "user" });
    }
    await db.collection("admins").doc(uids.admin).set({ role: "admin" });
    await db.collection("cities").doc("native-qa-city").set({ name: "Native QA City", state: "CA", country: "US", slug: "native-qa-city", active: true, timezone: "America/Los_Angeles" });
    await db.collection("categories").doc("native-fun").set({ name: "Native Fun", active: true, slug: "native-fun" });
    await db.collection("businesses").doc(businessId).set({ name: "Native Venue", status: "approved", isDemo: false, ownerIds: [uids.owner] });
    await db.collection("listings").doc(listingId).set({ businessId, title: "Native Activity", status: "published", approvalStatus: "approved", isDemo: false });
    await db.collection("bookingRequests").doc(bookingId).set({ userId: uids.customer, businessId, listingId, listingTitle: "Native Activity",
      businessName: "Native Venue", businessOwnerIds: [uids.owner], name: "Native Customer", email: "native-customer@gofunmotion.test",
      status: "confirmed", requestedDate: new Date(Date.now() - 3 * 86_400_000).toISOString().slice(0, 10), requestedTime: "19:00", partySize: 2 });
  }, 40_000);
  afterAll(async () => { await deleteApp(app); });

  it("saves customer preferences without accepting role elevation", async () => {
    const response = await write({ action: "profile", value1: "Edited name", value3: "native-qa-city", role: "admin" });
    expect(response.status).toBe(200);
    const data = (await getFirebaseAdminDb()!.collection("users").doc(uids.customer).get()).data();
    expect(data).toMatchObject({ displayName: "Edited name", role: "user", onboardingCompleted: true });
    expect(await (await read("profile")).json()).toMatchObject({ field1: "Edited name", field5: "Native QA City, CA" });
  });
  it("isolates customer requests and administrator queues", async () => {
    expect((await read("request", "customer", bookingId)).status).toBe(200);
    expect((await read("request", "stranger", bookingId)).status).toBe(404);
    expect((await read("admin-bookings", "customer")).status).toBe(403);
    expect((await read("admin-booking", "admin", bookingId)).status).toBe(200);
  });
  it("checks current business ownership, not stale booking owner snapshots", async () => {
    expect((await read("partner-request", "owner", bookingId)).status).toBe(200);
    const ref = getFirebaseAdminDb()!.collection("businesses").doc(businessId);
    await ref.update({ ownerIds: [uids.stranger] });
    expect((await read("partner-request", "owner", bookingId)).status).toBe(403);
    expect((await write({ action: "partner-status", id: bookingId, value1: "cancelled" }, "owner")).status).toBe(403);
    await ref.update({ ownerIds: [uids.owner] });
  });
  it("moderates one review per past confirmed booking", async () => {
    const body = { action: "review-submit", id: bookingId, value1: "5", value4: "The activity was well organised and welcoming." };
    expect((await write(body, "stranger")).status).toBe(404);
    expect((await write(body)).status).toBe(200);
    expect((await write(body)).status).toBe(409);
    expect(await (await read("reviews", "customer", listingId)).json()).toMatchObject({ rows: [] });
    expect((await write({ action: "admin-review-status", id: bookingId, value1: "approved" }, "admin")).status).toBe(200);
    const reviews = await (await read("reviews", "customer", listingId)).json();
    expect(reviews.rows).toHaveLength(1);
    expect(reviews.rows[0]).not.toHaveProperty("email");
  });
  it("records a confirmed cancellation and an in-app notification, without duplicate transitions", async () => {
    const response = await write({ action: "request-cancel", id: bookingId });
    expect(response.status).toBe(200);
    const db = getFirebaseAdminDb()!;
    expect((await db.collection("bookingRequests").doc(bookingId).get()).data()?.status).toBe("cancelled");
    expect((await db.collection("users").doc(uids.owner).collection("notifications").get()).empty).toBe(false);
    expect((await write({ action: "request-cancel", id: bookingId })).status).toBe(200);
    expect((await write({ action: "partner-status", id: bookingId, value1: "confirmed" }, "owner")).status).toBe(409);
  });
  it("deduplicates legacy cities and requires administrator access", async () => {
    const body = { action: "admin-city-save", value1: "native qa city", value2: "ca", value3: "America/Los_Angeles", flag: true };
    expect((await write(body)).status).toBe(403);
    expect(await (await write(body, "admin")).json()).toMatchObject({ id: "native-qa-city" });
    expect(await (await write({ ...body, value1: "Native QA City" }, "admin")).json()).toMatchObject({ id: "native-qa-city" });
    expect((await getFirebaseAdminDb()!.collection("cities").where("normalizedKey", "==", "native-qa-city|ca|us").get()).size).toBe(1);
  });
  it("gates team management on a nonexpired Pro subscription without granting login access", async () => {
    const db = getFirebaseAdminDb()!;
    const billing = db.collection("businessBilling").doc(businessId);
    const body = { action: "team-save", businessId, value1: "Studio contact", value2: "team@gofunmotion.test" };
    await billing.set({ paidAccessEnabled: true, pricingTier: "pro", subscriptionStatus: "active", subscriptionCurrentPeriodEnd: new Date(Date.now() - 1000).toISOString() });
    expect((await write(body, "owner")).status).toBe(403);
    await billing.update({ subscriptionCurrentPeriodEnd: new Date(Date.now() + 86_400_000).toISOString() });
    expect((await write(body, "owner")).status).toBe(200);
    expect((await db.collection("businesses").doc(businessId).get()).data()?.ownerIds).toEqual([uids.owner]);
    expect((await read("team", "stranger", "", businessId)).status).toBe(403);
  });
  it("never resets an existing business when an application is approved twice", async () => {
    const db = getFirebaseAdminDb()!;
    const applicationId = "native-approval-application";
    await db.collection("partnerApplications").doc(applicationId).set({ businessName: "Native Test Venue", city: "Native QA City", cityId: "native-qa-city",
      category: "Native Fun", categoryId: "native-fun", email: "native-owner@gofunmotion.test", status: "new" });
    const approve = (uid = uids.owner) => approveApplication(new Request("https://gofunmotion.test/api/admin/partner-applications/approve", {
      method: "POST", headers: { authorization: `Bearer ${tokens.admin}`, "content-type": "application/json" },
      body: JSON.stringify({ applicationId, ownerUid: uid, status: "approved" })
    }));
    const first = await approve();
    expect(first.status).toBe(201);
    const { businessId: createdId } = await first.json();
    const business = db.collection("businesses").doc(createdId);
    await business.update({ name: "Owner edited name", pricingTier: "pro", paidAccessEnabled: true });
    expect((await approve()).status).toBe(200);
    expect((await business.get()).data()).toMatchObject({ name: "Owner edited name", pricingTier: "pro", paidAccessEnabled: true, ownerIds: [uids.owner] });
    expect((await approve(uids.stranger)).status).toBe(409);
  });
});

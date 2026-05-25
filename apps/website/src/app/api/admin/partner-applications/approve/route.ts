import { slugify } from "../../../../../lib/slug";
import { jsonError, jsonOk } from "../../../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminAuth, getFirebaseAdminDb, verifyBearerToken } from "../../../../../lib/server/firebase-admin";

function clean(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseState(city: string) {
  const match = city.match(/,\s*([A-Z]{2})\b/);
  return match?.[1] ?? "";
}

async function verifyAdmin(request: Request) {
  const token = await verifyBearerToken(request);
  if (!token) return null;

  const db = getFirebaseAdminDb();
  if (!db) return null;

  const adminSnapshot = await db.collection("admins").doc(token.uid).get();
  return adminSnapshot.exists ? token : null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const applicationId = clean(body?.applicationId, 160);
  const ownerUid = clean(body?.ownerUid, 160);
  const approvalStatus = clean(body?.status, 40) || "approved";

  if (!applicationId || !ownerUid || !["approved", "reviewed"].includes(approvalStatus)) {
    return jsonError("Add applicationId, ownerUid, and a valid approval status.", 400);
  }

  const db = getFirebaseAdminDb();
  const auth = getFirebaseAdminAuth();
  if (!db || !auth) return jsonError("Firebase Admin is required for partner approvals.", 503);

  const adminToken = await verifyAdmin(request);
  if (!adminToken) return jsonError("Admin access is required.", 401);

  const owner = await auth.getUser(ownerUid).catch(() => null);
  if (!owner) return jsonError("Owner UID does not match a Firebase Auth user.", 400);

  const applicationRef = db.collection("partnerApplications").doc(applicationId);
  const applicationSnapshot = await applicationRef.get();
  if (!applicationSnapshot.exists) return jsonError("Partner application was not found.", 404);

  const application = applicationSnapshot.data() ?? {};
  const businessName = clean(application.businessName, 120);
  const city = clean(application.city, 120);
  const category = clean(application.category, 80);
  const email = clean(application.email, 254).toLowerCase();

  if (!businessName || !city || !category || !email) {
    return jsonError("Partner application is missing required business fields.", 400);
  }

  const businessId = `${slugify(businessName) || "business"}-${applicationId.slice(0, 8)}`;
  const businessRef = db.collection("businesses").doc(businessId);
  const categorySlug = slugify(category) || "local-activity";
  const cityId = slugify(city) || "coming-soon";
  const now = FieldValue.serverTimestamp();

  await db.runTransaction(async (transaction) => {
    transaction.set(
      businessRef,
      {
        addressLine1: "",
        addressLine2: null,
        categories: [categorySlug],
        cityId,
        country: "US",
        createdAt: now,
        description: clean(application.description, 1200),
        email,
        instagram: clean(application.instagram, 160) || null,
        isDemo: false,
        latitude: null,
        logoUrl: null,
        longitude: null,
        name: businessName,
        ownerIds: [ownerUid],
        paidAccessEnabled: false,
        phone: clean(application.phone, 60) || null,
        photos: [],
        postalCode: "",
        pricingTier: "starter",
        slug: slugify(businessName) || businessId,
        state: parseState(city),
        status: approvalStatus === "approved" ? "approved" : "pending",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        subscriptionCurrentPeriodEnd: null,
        subscriptionStatus: null,
        updatedAt: now,
        verificationStatus: "unverified",
        website: clean(application.website, 180) || null
      },
      { merge: true }
    );

    transaction.set(
      applicationRef,
      {
        approvedBusinessId: businessId,
        approvedOwnerUid: ownerUid,
        reviewedAt: now,
        reviewedBy: adminToken.uid,
        status: approvalStatus,
        updatedAt: now
      },
      { merge: true }
    );

    transaction.set(
      db.collection("users").doc(ownerUid),
      {
        email: owner.email ?? email,
        role: "business",
        updatedAt: now
      },
      { merge: true }
    );
  });

  return jsonOk({ businessId, status: approvalStatus }, 201);
}

import { createHash } from "node:crypto";
import { slugify } from "../../../../../lib/slug";
import { normalizeCitySelection } from "../../../../../lib/cities";
import { normalizeCategorySelection } from "../../../../../lib/categories";
import { jsonError, jsonOk } from "../../../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminAuth, getFirebaseAdminDb, verifyBearerToken } from "../../../../../lib/server/firebase-admin";
import { writeAdminAuditLog } from "../../../../../lib/server/admin-audit";
import { mobileId } from "../../../../../lib/mobile-workspace";

class ApprovalConflict extends Error {}

function clean(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function verifyAdmin(request: Request) {
  const token = await verifyBearerToken(request).catch(() => null);
  if (!token) return null;

  const db = getFirebaseAdminDb();
  if (!db) return null;

  const adminSnapshot = await db.collection("admins").doc(token.uid).get();
  return adminSnapshot.exists ? token : null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const applicationId = mobileId(body?.applicationId);
  const ownerUid = mobileId(body?.ownerUid);
  const approvalStatus = clean(body?.status, 40) || "approved";

  if (!applicationId || !ownerUid || !["approved", "reviewed"].includes(approvalStatus)) {
    return jsonError("Add applicationId, ownerUid, and a valid approval status.", 400);
  }

  const db = getFirebaseAdminDb();
  const auth = getFirebaseAdminAuth();
  if (!db || !auth) return jsonError("Admin approval tools are not connected yet.", 503);

  const adminToken = await verifyAdmin(request);
  if (!adminToken) return jsonError("Admin access is required.", 401);

  const owner = await auth.getUser(ownerUid).catch(() => null);
  if (!owner || owner.disabled) return jsonError("Owner UID must match an active account.", 400);

  const applicationRef = db.collection("partnerApplications").doc(applicationId);
  const applicationSnapshot = await applicationRef.get();
  if (!applicationSnapshot.exists) return jsonError("Partner application was not found.", 404);

  const application = applicationSnapshot.data() ?? {};
  const businessName = clean(application.businessName, 120);
  const city = clean(application.city, 120);
  const applicationCityId = clean(application.cityId, 120);
  const applicationCityName = clean(application.cityName, 120);
  const category = clean(application.category, 80);
  const applicationCategoryId = clean(application.categoryId, 120);
  const applicationCategoryName = clean(application.categoryName, 120);
  const email = clean(application.email, 254).toLowerCase();

  if (!businessName || !city || !category || !email) {
    return jsonError("Partner application is missing required business fields.", 400);
  }

  const applicationKey = createHash("sha256").update(applicationId).digest("hex").slice(0, 24);
  const businessId = mobileId(application.approvedBusinessId) || `${slugify(businessName).slice(0, 80) || "business"}-${applicationKey}`;
  const businessRef = db.collection("businesses").doc(businessId);
  const categorySnapshot = applicationCategoryId ? await db.collection("categories").doc(applicationCategoryId).get() : null;
  const categoryData = categorySnapshot?.exists ? categorySnapshot.data() : null;
  const fallbackCategory = normalizeCategorySelection({ category, categoryId: applicationCategoryId });
  const categorySlug = categorySnapshot?.exists ? applicationCategoryId : fallbackCategory.categoryId || slugify(category) || "local-activity";
  const categoryName = categoryData ? clean(categoryData.name, 120) : applicationCategoryName || fallbackCategory.categoryName;
  const citySnapshot = applicationCityId ? await db.collection("cities").doc(applicationCityId).get() : null;
  const cityData = citySnapshot?.exists ? citySnapshot.data() : null;
  const fallbackCity = normalizeCitySelection({ city, cityId: applicationCityId });
  const cityId = citySnapshot?.exists ? applicationCityId : fallbackCity.cityId;
  const cityName = cityData ? clean(cityData.name, 120) : applicationCityName || fallbackCity.cityName;
  const cityState = cityData ? clean(cityData.state, 80) : fallbackCity.state;
  const now = FieldValue.serverTimestamp();

  let result: { created: boolean; status: string };
  try {
    result = await db.runTransaction(async (transaction) => {
      const [currentApplication, currentBusiness] = await Promise.all([
        transaction.get(applicationRef), transaction.get(businessRef)
      ]);
      if (!currentApplication.exists || !currentApplication.updateTime ||
        !applicationSnapshot.updateTime?.isEqual(currentApplication.updateTime)) {
        throw new ApprovalConflict("Application changed. Refresh it before approving.");
      }
      // Approval retries must never replace ownership, billing or edited profile data.
      if (currentBusiness.exists) {
        const existing = currentBusiness.data() ?? {};
        if (application.approvedBusinessId !== businessId || application.approvedOwnerUid !== ownerUid ||
          !Array.isArray(existing.ownerIds) || !existing.ownerIds.includes(ownerUid)) {
          throw new ApprovalConflict("An existing business cannot be reassigned through application approval.");
        }
        if (["suspended", "rejected"].includes(existing.status)) {
          throw new ApprovalConflict("Review the existing business status before approving this application.");
        }
        const status = existing.status === "approved" || approvalStatus === "approved" ? "approved" : "reviewed";
        if (status === "approved" && existing.status !== "approved") {
          transaction.update(businessRef, { status: "approved", updatedAt: now });
        }
        if (currentApplication.data()?.status !== status) {
          transaction.update(applicationRef, { status, reviewedBy: adminToken.uid, reviewedAt: now, updatedAt: now });
        }
        return { created: false, status };
      }
      if (application.approvedBusinessId) {
        throw new ApprovalConflict("The linked business is missing. Resolve it before approving again.");
      }
      transaction.create(businessRef, {
        addressLine1: "",
        applicationId,
        addressLine2: null,
        categories: [categorySlug],
        categoryNames: [categoryName],
        cityId,
        cityName,
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
        state: cityState,
        status: approvalStatus === "approved" ? "approved" : "pending",
        updatedAt: now,
        verificationStatus: "unverified",
        website: clean(application.website, 180) || null
      });

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
      return { created: true, status: approvalStatus };
    });
  } catch (error) {
    return jsonError(error instanceof ApprovalConflict ? error.message : "Approval could not be saved. Please retry.", error instanceof ApprovalConflict ? 409 : 503);
  }

  await writeAdminAuditLog({
    action: `partnerApplication.${result.status}`,
    actorUid: adminToken.uid,
    metadata: { businessId, ownerUid },
    request,
    targetId: applicationId,
    targetType: "partnerApplication"
  });

  return jsonOk({ businessId, status: result.status, alreadyCreated: !result.created }, result.created ? 201 : 200);
}

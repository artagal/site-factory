import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  USER_DOCUMENT_SUBCOLLECTIONS,
  USER_FIELD_OWNED_COLLECTIONS,
  USER_OWNED_COLLECTIONS,
  USER_TOP_LEVEL_DOCUMENTS
} from "../apps/website/src/lib/account-deletion";

type IndexField = {
  arrayConfig?: "CONTAINS";
  fieldPath: string;
  order?: "ASCENDING" | "DESCENDING";
};

type FirestoreIndex = {
  collectionGroup: string;
  fields: IndexField[];
  queryScope: "COLLECTION" | "COLLECTION_GROUP";
};

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const rules = readFileSync(resolve(repoRoot, "firestore.rules"), "utf8").replace(/\s+/g, " ");
const schemaDoc = readFileSync(resolve(repoRoot, "docs/FIREBASE_SCHEMA_GOFUNMOTION_DEALS.md"), "utf8");
const targetDataModelDoc = readFileSync(resolve(repoRoot, "docs/FIREBASE_DATA_MODEL.md"), "utf8");
const indexes = JSON.parse(readFileSync(resolve(repoRoot, "firestore.indexes.json"), "utf8")) as {
  indexes: FirestoreIndex[];
};

function fieldSignature(field: IndexField) {
  return `${field.fieldPath}:${field.order ?? field.arrayConfig ?? "none"}`;
}

function expectIndex(collectionGroup: string, fields: IndexField[]) {
  const expected = fields.map(fieldSignature);
  const found = indexes.indexes.some((index) => {
    return index.collectionGroup === collectionGroup &&
      index.queryScope === "COLLECTION" &&
      index.fields.map(fieldSignature).join("|") === expected.join("|");
  });

  expect(found, `${collectionGroup} index ${expected.join(", ")}`).toBe(true);
}

describe("Firebase production readiness", () => {
  it("keeps account deletion scoped to Deals user-owned records", () => {
    expect([...USER_DOCUMENT_SUBCOLLECTIONS]).toEqual(["savedListings", "savedPlans"]);
    expect([...USER_OWNED_COLLECTIONS]).toEqual(["savedListings", "savedPlans", "plans", "bookingRequests"]);
    expect([...USER_TOP_LEVEL_DOCUMENTS]).toEqual(["customer_profiles", "provider_profiles", "subscriptions"]);
    expect([...USER_FIELD_OWNED_COLLECTIONS]).toEqual(expect.arrayContaining([
      { collectionName: "favorites", fieldPath: "userId" },
      { collectionName: "device_tokens", fieldPath: "userId" },
      { collectionName: "reports", fieldPath: "reporterId" },
      { collectionName: "booking_requests", fieldPath: "customerId" },
      { collectionName: "booking_requests", fieldPath: "providerId" },
      { collectionName: "reviews", fieldPath: "customerId" },
      { collectionName: "reviews", fieldPath: "providerId" },
      { collectionName: "drops", fieldPath: "providerId" }
    ]));
    expect([...USER_DOCUMENT_SUBCOLLECTIONS, ...USER_OWNED_COLLECTIONS]).not.toContain("completedChallenges");
    expect([...USER_DOCUMENT_SUBCOLLECTIONS, ...USER_OWNED_COLLECTIONS]).not.toContain("savedChallenges");
  });

  it("protects saved items, booking requests, partner listings, and admin moderation in rules", () => {
    expect(rules).toContain("match /users/{userId}");
    expect(rules).toContain("match /savedListings/{listingId}");
    expect(rules).toContain("match /savedPlans/{planId}");
    expect(rules).toContain("match /savedListings/{savedListingId}");
    expect(rules).toContain("match /savedPlans/{savedPlanId}");
    expect(rules).toContain("resource.data.userId == request.auth.uid");

    expect(rules).toContain("function validBookingListingLink()");
    expect(rules).toContain("canReadPublishedListing(get(/databases/$(database)/documents/listings/$(request.resource.data.listingId)).data)");
    expect(rules).toContain("request.resource.data.businessId == get(/databases/$(database)/documents/listings/$(request.resource.data.listingId)).data.businessId");
    expect(rules).toContain("request.resource.data.cityId == get(/databases/$(database)/documents/listings/$(request.resource.data.listingId)).data.cityId");
    expect(rules).toContain("canPartnerUpdateBookingRequest(resource.data)");
    expect(rules).toContain("request.resource.data.diff(data).changedKeys().hasOnly([ \"status\", \"updatedAt\" ])");
    expect(rules).toContain("allow delete: if isAdmin()");

    expect(rules).toContain("function validPartnerListingCreate()");
    expect(rules).toContain("function partnerListingReviewFieldsLocked(data)");
    expect(rules).toContain("request.resource.data.approvalStatus == data.approvalStatus");
    expect(rules).toContain("request.resource.data.featured == data.featured");
    expect(rules).toContain("request.resource.data.promoted == data.promoted");
    expect(rules).toContain("allow update: if isAdmin() || validPartnerListingUpdate(resource.data)");

    expect(rules).toContain("match /admin_users/{userId}");
    expect(rules).toContain("match /customer_profiles/{userId}");
    expect(rules).toContain("match /provider_profiles/{userId}");
    expect(rules).toContain("match /drops/{dropId}");
    expect(rules).toContain("match /booking_requests/{requestId}");
    expect(rules).toContain("match /favorites/{favoriteId}");
    expect(rules).toContain("match /reviews/{reviewId}");
    expect(rules).toContain("match /reports/{reportId}");
    expect(rules).toContain("match /admin_actions/{actionId}");
    expect(rules).toContain("match /device_tokens/{tokenId}");
    expect(rules).toContain("match /subscriptions/{userId}");
    expect(rules).toContain("function validGoFunBookingCreate()");
    expect(rules).toContain("isApprovedActiveDrop(get(/databases/$(database)/documents/drops/$(request.resource.data.dropId)).data)");
    expect(rules).toContain("request.resource.data.moderationStatus in [\"draft\", \"pending_review\"]");
  });

  it("ships composite indexes for public, saved, booking, partner, and admin query paths", () => {
    expectIndex("listings", [
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "approvalStatus", order: "ASCENDING" }
    ]);
    expectIndex("listings", [
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "approvalStatus", order: "ASCENDING" },
      { fieldPath: "cityId", order: "ASCENDING" }
    ]);
    expectIndex("listings", [
      { fieldPath: "slug", order: "ASCENDING" },
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "approvalStatus", order: "ASCENDING" }
    ]);
    expectIndex("listings", [
      { fieldPath: "businessId", order: "ASCENDING" },
      { fieldPath: "updatedAt", order: "DESCENDING" }
    ]);
    expectIndex("listings", [
      { fieldPath: "isApproved", order: "ASCENDING" },
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]);
    expectIndex("businesses", [
      { fieldPath: "ownerIds", arrayConfig: "CONTAINS" },
      { fieldPath: "status", order: "ASCENDING" }
    ]);
    expectIndex("savedListings", [
      { fieldPath: "userId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]);
    expectIndex("savedPlans", [
      { fieldPath: "userId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]);
    expectIndex("bookingRequests", [
      { fieldPath: "userId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]);
    expectIndex("bookingRequests", [
      { fieldPath: "businessId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]);
    expectIndex("bookingRequests", [
      { fieldPath: "businessOwnerIds", arrayConfig: "CONTAINS" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]);
    expectIndex("partnerApplications", [
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]);
    expectIndex("drops", [
      { fieldPath: "moderationStatus", order: "ASCENDING" },
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "city", order: "ASCENDING" },
      { fieldPath: "startAt", order: "ASCENDING" }
    ]);
    expectIndex("drops", [
      { fieldPath: "moderationStatus", order: "ASCENDING" },
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "category", order: "ASCENDING" },
      { fieldPath: "startAt", order: "ASCENDING" }
    ]);
    expectIndex("drops", [
      { fieldPath: "providerId", order: "ASCENDING" },
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "updatedAt", order: "DESCENDING" }
    ]);
    expectIndex("booking_requests", [
      { fieldPath: "customerId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]);
    expectIndex("booking_requests", [
      { fieldPath: "providerId", order: "ASCENDING" },
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]);
    expectIndex("favorites", [
      { fieldPath: "userId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]);
    expectIndex("favorites", [
      { fieldPath: "userId", order: "ASCENDING" },
      { fieldPath: "dropId", order: "ASCENDING" }
    ]);
    expectIndex("reviews", [
      { fieldPath: "providerId", order: "ASCENDING" },
      { fieldPath: "moderationStatus", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]);
    expectIndex("reports", [
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "ASCENDING" }
    ]);
    expectIndex("admin_actions", [
      { fieldPath: "targetType", order: "ASCENDING" },
      { fieldPath: "targetId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]);
  });

  it("documents the deployable Firebase contract for release handoff", () => {
    for (const requiredLine of [
      "`status + approvalStatus`, public approved listing feeds",
      "`slug + status + approvalStatus`, public listing detail lookup",
      "`businessId + updatedAt`, partner dashboard sorting",
      "`isApproved + status + createdAt`, FlutterFlow first-pass approved listing feeds",
      "`ownerIds + status`, web partner dashboard owner filters",
      "`businessOwnerIds + createdAt`"
    ]) {
      expect(schemaDoc).toContain(requiredLine);
    }

    for (const requiredLine of [
      "## users/{uid}",
      "## customer_profiles/{uid}",
      "## provider_profiles/{uid}",
      "## drops/{dropId}",
      "## booking_requests/{requestId}",
      "## favorites/{favoriteId}",
      "## reviews/{reviewId}",
      "## reports/{reportId}",
      "## admin_actions/{actionId}",
      "## device_tokens/{tokenId}",
      "## subscriptions/{userId}"
    ]) {
      expect(targetDataModelDoc).toContain(requiredLine);
    }
  });
});

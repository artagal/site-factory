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
    expect([...USER_DOCUMENT_SUBCOLLECTIONS]).toEqual([
      "deviceTokens",
      "notifications",
      "savedListings",
      "savedPlans"
    ]);
    expect([...USER_OWNED_COLLECTIONS]).toEqual(["plans", "bookingRequests"]);
    expect([...USER_TOP_LEVEL_DOCUMENTS]).toEqual([]);
    expect([...USER_FIELD_OWNED_COLLECTIONS]).toEqual([]);
    expect([...USER_DOCUMENT_SUBCOLLECTIONS, ...USER_OWNED_COLLECTIONS]).not.toContain("completedChallenges");
    expect([...USER_DOCUMENT_SUBCOLLECTIONS, ...USER_OWNED_COLLECTIONS]).not.toContain("savedChallenges");
  });

  it("protects saved items, booking requests, partner listings, and admin moderation in rules", () => {
    expect(rules).toContain("match /users/{userId}");
    expect(rules).toContain("match /savedListings/{listingId}");
    expect(rules).toContain("match /savedPlans/{planId}");
    expect(rules).toContain("match /deviceTokens/{tokenId}");
    expect(rules).toContain("match /notifications/{notificationId}");
    expect(rules).toContain("allow read: if isAdmin() || resource.data.active == true || resource.data.comingSoon == true");
    expect(rules).toContain("allow read: if isAdmin() || resource.data.active == true");
    expect(rules).toContain("resource.data.userId == request.auth.uid");

    expect(rules).toContain("function validBookingCreate()");
    expect(rules).toContain("isPublishedListingData( get(/databases/$(database)/documents/listings/$(request.resource.data.listingId)).data )");
    expect(rules).toContain("request.resource.data.businessId == get(/databases/$(database)/documents/listings/$(request.resource.data.listingId)).data.businessId");
    expect(rules).toContain("request.resource.data.cityId == get(/databases/$(database)/documents/listings/$(request.resource.data.listingId)).data.cityId");
    expect(rules).toContain("allow update, delete: if isAdmin()");
    expect(rules).toContain("allow delete: if isAdmin()");

    expect(rules).toContain("function validPartnerListingCreate()");
    expect(rules).toContain("request.resource.data.approvalStatus == resource.data.approvalStatus");
    expect(rules).toContain("request.resource.data.featured == resource.data.featured");
    expect(rules).toContain("request.resource.data.promoted == resource.data.promoted");
    expect(rules).toContain("allow update: if isAdmin() || validPartnerListingUpdate()");

    expect(rules).toContain("match /adminAuditLogs/{eventId}");
    expect(rules).toContain("match /emailDeliveryEvents/{eventId}");
    expect(rules).toContain("match /{document=**}");
    expect(rules).not.toContain("match /drops/{dropId}");
    expect(rules).not.toContain("match /booking_requests/{requestId}");
    expect(rules).not.toContain("match /favorites/{favoriteId}");
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
    expectIndex("businesses", [
      { fieldPath: "ownerIds", arrayConfig: "CONTAINS" },
      { fieldPath: "status", order: "ASCENDING" }
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
    expectIndex("adminAuditLogs", [
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
      "`ownerIds + status`, web partner dashboard owner filters",
      "`businessOwnerIds + createdAt`"
    ]) {
      expect(schemaDoc).toContain(requiredLine);
    }

    for (const requiredLine of [
      "## users/{uid}",
      "## businesses/{businessId}",
      "## listings/{listingId}",
      "## bookingRequests/{requestId}",
      "## users/{uid}/savedListings/{listingId}",
      "## users/{uid}/savedPlans/{planId}",
      "## users/{uid}/deviceTokens/{tokenId}",
      "## users/{uid}/notifications/{notificationId}",
      "## adminAuditLogs/{eventId}"
    ]) {
      expect(targetDataModelDoc).toContain(requiredLine);
    }
  });
});

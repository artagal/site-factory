import { describe, expect, it } from "vitest";
import { normalizeBusinessDocument, normalizeCategoryDocument, normalizeCityDocument, normalizeListingDocument } from "../apps/website/src/lib/firestore-model";

describe("Firestore marketplace model normalization", () => {
  it("keeps historical businesses without array fields safe for partner UI", () => {
    const business = normalizeBusinessDocument("business-1", {
      cityId: "miami",
      name: "Test Studio",
      ownerIds: ["owner-1"],
      status: "approved"
    });

    expect(business.categories).toEqual([]);
    expect(business.photos).toEqual([]);
    expect(business.isDemo).toBe(false);
    expect(business.pricingTier).toBe("starter");
  });

  it("normalizes historical listings into the canonical marketplace shape", () => {
    const listing = normalizeListingDocument("listing-1", {
      approvalStatus: "approved",
      businessId: "business-1",
      cityId: "miami",
      price: 29,
      status: "published",
      title: "Tonight test deal"
    });

    expect(listing.availableSlots).toEqual([]);
    expect(listing.categoryIds).toEqual([]);
    expect(listing.groupTypes).toEqual(["date", "friends"]);
    expect(listing.vibeTags).toEqual(["social"]);
    expect(listing.isDemo).toBe(false);
  });

  it("keeps incomplete city and category records admin-readable without making them public", () => {
    expect(normalizeCityDocument("miami", { name: "Miami" })).toMatchObject({ active: false, comingSoon: true });
    expect(normalizeCategoryDocument("comedy", { name: "Comedy" })).toMatchObject({ active: false, sortOrder: 100 });
  });
});

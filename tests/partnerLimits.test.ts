import { describe, expect, it } from "vitest";
import {
  countLimitedListings,
  canFeatureListings,
  canPromoteListings,
  formatActiveListingLimit,
  getEffectivePartnerTier,
  getPartnerTierCapabilities,
  isLimitedListingStatus
} from "../apps/website/src/lib/partner-limits";

describe("partner paid-tier limits", () => {
  it("falls back to Starter unless paid access is enabled", () => {
    expect(getEffectivePartnerTier({ paidAccessEnabled: false, pricingTier: "pro" })).toBe("starter");
    expect(getEffectivePartnerTier({ paidAccessEnabled: true, pricingTier: "growth" })).toBe("growth");
  });

  it("counts only active-slot listing statuses", () => {
    expect(isLimitedListingStatus("draft")).toBe(true);
    expect(isLimitedListingStatus("pending_approval")).toBe(true);
    expect(isLimitedListingStatus("published")).toBe(true);
    expect(isLimitedListingStatus("paused")).toBe(false);
    expect(countLimitedListings([
      { id: "draft", status: "draft" },
      { id: "paused", status: "paused" },
      { id: "published", status: "published" }
    ])).toBe(2);
    expect(countLimitedListings([
      { id: "draft", status: "draft" },
      { id: "published", status: "published" }
    ], "draft")).toBe(1);
  });

  it("returns tier capabilities for UI and server checks", () => {
    expect(getPartnerTierCapabilities({ paidAccessEnabled: false, pricingTier: "starter" }).activeListings).toBe(1);
    expect(getPartnerTierCapabilities({ paidAccessEnabled: true, pricingTier: "growth" }).activeListings).toBe(10);
    expect(formatActiveListingLimit(getPartnerTierCapabilities({ paidAccessEnabled: true, pricingTier: "pro" }).activeListings)).toBe("Unlimited");
  });

  it("gates paid placement by active paid tier", () => {
    expect(canFeatureListings({ paidAccessEnabled: false, pricingTier: "growth" })).toBe(false);
    expect(canFeatureListings({ paidAccessEnabled: true, pricingTier: "growth" })).toBe(true);
    expect(canPromoteListings({ paidAccessEnabled: true, pricingTier: "growth" })).toBe(false);
    expect(canPromoteListings({ paidAccessEnabled: true, pricingTier: "pro" })).toBe(true);
  });
});

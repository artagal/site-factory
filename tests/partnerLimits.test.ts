import { describe, expect, it } from "vitest";
import {
  countLimitedListings,
  formatActiveListingLimit,
  getEffectivePartnerTier,
  getPartnerTierCapabilities,
  isLimitedListingStatus
} from "../apps/website/src/lib/partner-limits";

describe("partner paid-tier limits", () => {
  it("falls back to Starter unless paid access is enabled", () => {
    expect(getEffectivePartnerTier({ paidAccessEnabled: false, pricingTier: "pro", subscriptionStatus: "canceled" })).toBe("starter");
    expect(getEffectivePartnerTier({ paidAccessEnabled: true, pricingTier: "growth", subscriptionStatus: "active" })).toBe("growth");
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
    expect(getPartnerTierCapabilities({ paidAccessEnabled: false, pricingTier: "starter", subscriptionStatus: null }).activeListings).toBe(1);
    expect(getPartnerTierCapabilities({ paidAccessEnabled: true, pricingTier: "growth", subscriptionStatus: "active" }).activeListings).toBe(10);
    expect(formatActiveListingLimit(getPartnerTierCapabilities({ paidAccessEnabled: true, pricingTier: "pro", subscriptionStatus: "active" }).activeListings)).toBe("Unlimited");
  });
});

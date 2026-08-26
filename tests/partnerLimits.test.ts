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

const active = { subscriptionStatus: "active", subscriptionCurrentPeriodEnd: "2099-01-01T00:00:00Z" };

describe("partner paid-tier limits", () => {
  it("falls back to Starter unless paid access is enabled", () => {
    expect(getEffectivePartnerTier({ paidAccessEnabled: false, pricingTier: "pro" })).toBe("starter");
    expect(getEffectivePartnerTier({ ...active, paidAccessEnabled: true, pricingTier: "growth" })).toBe("growth");
    expect(getEffectivePartnerTier({ paidAccessEnabled: true, pricingTier: "growth" })).toBe("starter");
    expect(getEffectivePartnerTier({ ...active, paidAccessEnabled: true, pricingTier: "growth", subscriptionCurrentPeriodEnd: "2020-01-01T00:00:00Z" })).toBe("starter");
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
    expect(getPartnerTierCapabilities({ ...active, paidAccessEnabled: true, pricingTier: "growth" }).activeListings).toBe(10);
    expect(formatActiveListingLimit(getPartnerTierCapabilities({ ...active, paidAccessEnabled: true, pricingTier: "pro" }).activeListings)).toBe("Unlimited");
  });

  it("gates paid placement by active paid tier", () => {
    expect(canFeatureListings({ paidAccessEnabled: false, pricingTier: "growth" })).toBe(false);
    expect(canFeatureListings({ ...active, paidAccessEnabled: true, pricingTier: "growth" })).toBe(true);
    expect(canPromoteListings({ ...active, paidAccessEnabled: true, pricingTier: "growth" })).toBe(false);
    expect(canPromoteListings({ ...active, paidAccessEnabled: true, pricingTier: "pro" })).toBe(true);
  });
});

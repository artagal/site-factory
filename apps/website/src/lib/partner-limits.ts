import type { Business } from "../types/deals";

export type PartnerTier = "starter" | "growth" | "pro";

export type PartnerTierCapabilities = {
  activeListings: number;
  analyticsLevel: "basic" | "standard" | "advanced";
  canUseFeaturedPlacement: boolean;
  canRunCampaigns: boolean;
  canUsePriorityPlacement: boolean;
  label: string;
};

export const LIMITED_LISTING_STATUSES = ["draft", "pending_approval", "published"] as const;

export const PARTNER_TIER_CAPABILITIES: Record<PartnerTier, PartnerTierCapabilities> = {
  starter: {
    activeListings: 1,
    analyticsLevel: "basic",
    canUseFeaturedPlacement: false,
    canRunCampaigns: false,
    canUsePriorityPlacement: false,
    label: "Starter"
  },
  growth: {
    activeListings: 10,
    analyticsLevel: "standard",
    canUseFeaturedPlacement: true,
    canRunCampaigns: true,
    canUsePriorityPlacement: false,
    label: "Growth"
  },
  pro: {
    activeListings: Number.POSITIVE_INFINITY,
    analyticsLevel: "advanced",
    canUseFeaturedPlacement: true,
    canRunCampaigns: true,
    canUsePriorityPlacement: true,
    label: "Pro"
  }
};

export function getEffectivePartnerTier(
  business: Pick<Business, "paidAccessEnabled" | "pricingTier">
): PartnerTier {
  if (business.pricingTier === "pro" || business.pricingTier === "growth") {
    return business.paidAccessEnabled ? business.pricingTier : "starter";
  }

  return "starter";
}

export function canFeatureListings(
  business: Pick<Business, "paidAccessEnabled" | "pricingTier">
) {
  return getPartnerTierCapabilities(business).canUseFeaturedPlacement;
}

export function canPromoteListings(
  business: Pick<Business, "paidAccessEnabled" | "pricingTier">
) {
  return getPartnerTierCapabilities(business).canUsePriorityPlacement;
}

export function getPartnerTierCapabilities(
  business: Pick<Business, "paidAccessEnabled" | "pricingTier">
) {
  const tier = getEffectivePartnerTier(business);
  return {
    ...PARTNER_TIER_CAPABILITIES[tier],
    tier
  };
}

export function isLimitedListingStatus(status: string | null | undefined) {
  return LIMITED_LISTING_STATUSES.includes(status as (typeof LIMITED_LISTING_STATUSES)[number]);
}

export function countLimitedListings(
  listings: Array<{ id: string; status?: string | null }>,
  excludeListingId?: string
) {
  return listings.filter((listing) => listing.id !== excludeListingId && isLimitedListingStatus(listing.status)).length;
}

export function formatActiveListingLimit(limit: number) {
  return Number.isFinite(limit) ? String(limit) : "Unlimited";
}

export function getTierLimitMessage(
  business: Pick<Business, "paidAccessEnabled" | "pricingTier">,
  activeCount: number
) {
  const capabilities = getPartnerTierCapabilities(business);
  const limit = capabilities.activeListings;

  if (!Number.isFinite(limit)) {
    return `Pro includes unlimited active deals. You currently have ${activeCount}.`;
  }

  return `${capabilities.label} includes ${limit} active ${limit === 1 ? "deal" : "deals"}. You currently have ${activeCount}.`;
}

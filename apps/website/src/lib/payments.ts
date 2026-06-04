export type PartnerPricingTier = "starter" | "growth" | "pro";

export type PaidPartnerPricingTier = Exclude<PartnerPricingTier, "starter">;

export const partnerPricingTiers: Array<{
  cta: string;
  description: string;
  features: string[];
  name: string;
  price: string;
  tier: PartnerPricingTier;
}> = [
  {
    cta: "Apply for free",
    description: "Validate fit before anything paid is required.",
    features: ["1 active open-slot deal", "Booking requests", "Basic business profile", "Admin approval required"],
    name: "Starter",
    price: "Free",
    tier: "starter"
  },
  {
    cta: "Start Growth",
    description: "For businesses ready to run recurring open-slot campaigns.",
    features: ["Up to 10 active deals", "Slow-hour campaigns", "Basic analytics", "Featured city eligibility"],
    name: "Growth",
    price: "$29/mo",
    tier: "growth"
  },
  {
    cta: "Start Pro",
    description: "For partners that want higher visibility and more deal volume.",
    features: ["Unlimited active deals", "Priority placement", "Advanced analytics", "Promoted last-minute campaigns"],
    name: "Pro",
    price: "$99/mo",
    tier: "pro"
  }
];

export const paidPartnerTiers = partnerPricingTiers.filter(
  (tier): tier is (typeof partnerPricingTiers)[number] & { tier: PaidPartnerPricingTier } => tier.tier !== "starter"
);

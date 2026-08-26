import type { Business, Category, City, Listing } from "../types/deals";
import { billingDate } from "./partner-entitlements";
import { normalizePartnerSubscriptionStatus } from "./stripe-billing";

type FirestoreDocument = Record<string, unknown>;

const APPROVAL_STATUSES = new Set<Listing["approvalStatus"]>(["pending", "approved", "rejected"]);
const BUDGET_TIERS = new Set<Listing["budgetTier"]>(["free", "under25", "under50", "under100", "premium"]);
const GROUP_TYPES = new Set<Listing["groupTypes"][number]>(["solo", "date", "friends", "family", "kids"]);
const LISTING_STATUSES = new Set<Listing["status"]>(["draft", "pending_approval", "published", "paused", "expired"]);
const LISTING_TYPES = new Set<Listing["listingType"]>(["deal", "activity", "event", "class", "experience"]);
const VIBE_TAGS = new Set<Listing["vibeTags"][number]>([
  "chill",
  "romantic",
  "active",
  "social",
  "creative",
  "family-friendly",
  "adventurous",
  "low-energy",
  "rainy-day",
  "surprise-me"
]);

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function numericValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function nullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeAiReview(value: unknown): Listing["aiReview"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const review = value as FirestoreDocument;
  const riskLevel = review.riskLevel === "low" || review.riskLevel === "high" ? review.riskLevel : "medium";
  const status = review.status === "approved" || review.status === "needs_changes" || review.status === "rejected"
    ? review.status
    : "pending_admin_review";

  return {
    categoryMatch: review.categoryMatch === true,
    issues: stringArray(review.issues),
    provider: review.provider === "openai" ? "openai" : "rules",
    reviewedAt: optionalString(review.reviewedAt),
    riskLevel,
    status,
    suggestedFixes: stringArray(review.suggestedFixes),
    summary: String(review.summary ?? "Listing review is pending.")
  };
}

export function normalizeBusinessDocument(id: string, data: FirestoreDocument): Business {
  const pricingTier = data.pricingTier === "growth" || data.pricingTier === "pro" ? data.pricingTier : "starter";
  const status = data.status === "approved" || data.status === "rejected" || data.status === "suspended" ? data.status : "pending";

  return {
    addressLine1: String(data.addressLine1 ?? ""),
    addressLine2: optionalString(data.addressLine2),
    categories: stringArray(data.categories),
    cityId: String(data.cityId ?? ""),
    ...(optionalString(data.cityName) ? { cityName: optionalString(data.cityName) ?? undefined } : {}),
    country: String(data.country ?? "US"),
    description: String(data.description ?? ""),
    email: String(data.email ?? ""),
    id,
    instagram: optionalString(data.instagram),
    isDemo: data.isDemo === true,
    latitude: nullableNumber(data.latitude),
    logoUrl: optionalString(data.logoUrl),
    longitude: nullableNumber(data.longitude),
    name: String(data.name ?? "Local business"),
    ownerIds: stringArray(data.ownerIds),
    paidAccessEnabled: data.paidAccessEnabled === true,
    phone: optionalString(data.phone),
    photos: stringArray(data.photos),
    postalCode: String(data.postalCode ?? ""),
    pricingTier,
    subscriptionStatus: normalizePartnerSubscriptionStatus(data.subscriptionStatus),
    subscriptionCurrentPeriodEnd: billingDate(data.subscriptionCurrentPeriodEnd),
    subscriptionProvider: data.subscriptionProvider === "stripe" || data.subscriptionProvider === "app_store" || data.subscriptionProvider === "play_store"
      ? data.subscriptionProvider : null,
    slug: String(data.slug ?? id),
    state: String(data.state ?? ""),
    status,
    verificationStatus: data.verificationStatus === "verified" ? "verified" : "unverified",
    website: optionalString(data.website)
  };
}

export function normalizeCategoryDocument(id: string, data: FirestoreDocument): Category {
  return {
    accentColor: String(data.accentColor ?? "#bef264"),
    active: data.active === true,
    description: String(data.description ?? ""),
    icon: String(data.icon ?? "Sparkles"),
    id,
    name: String(data.name ?? "Activity"),
    slug: String(data.slug ?? id),
    sortOrder: numericValue(data.sortOrder, 100)
  };
}

export function normalizeCityDocument(id: string, data: FirestoreDocument): City {
  return {
    active: data.active === true,
    comingSoon: data.comingSoon === true || data.active !== true,
    country: String(data.country ?? "US"),
    description: String(data.description ?? ""),
    heroImageUrl: optionalString(data.heroImageUrl),
    id,
    name: String(data.name ?? "Local city"),
    slug: String(data.slug ?? id),
    state: String(data.state ?? ""),
    timezone: String(data.timezone ?? "America/New_York")
  };
}

export function normalizeListingDocument(id: string, data: FirestoreDocument): Listing {
  const approvalStatus = APPROVAL_STATUSES.has(data.approvalStatus as Listing["approvalStatus"])
    ? data.approvalStatus as Listing["approvalStatus"]
    : "pending";
  const budgetTier = BUDGET_TIERS.has(data.budgetTier as Listing["budgetTier"])
    ? data.budgetTier as Listing["budgetTier"]
    : "under50";
  const listingStatus = LISTING_STATUSES.has(data.status as Listing["status"])
    ? data.status as Listing["status"]
    : "draft";
  const listingType = LISTING_TYPES.has(data.listingType as Listing["listingType"])
    ? data.listingType as Listing["listingType"]
    : "deal";
  const groupTypes = stringArray(data.groupTypes).filter((item): item is Listing["groupTypes"][number] => GROUP_TYPES.has(item as Listing["groupTypes"][number]));
  const vibeTags = stringArray(data.vibeTags).filter((item): item is Listing["vibeTags"][number] => VIBE_TAGS.has(item as Listing["vibeTags"][number]));
  const aiReview = normalizeAiReview(data.aiReview);

  return {
    ...(aiReview ? { aiReview } : {}),
    approvalStatus,
    availableDays: stringArray(data.availableDays),
    availableFrom: optionalString(data.availableFrom),
    availableSlots: stringArray(data.availableSlots),
    availableUntil: optionalString(data.availableUntil),
    bookingMode: data.bookingMode === "external_link" || data.bookingMode === "phone" ? data.bookingMode : "request",
    bookingUrl: optionalString(data.bookingUrl),
    budgetTier,
    businessId: String(data.businessId ?? ""),
    businessName: String(data.businessName ?? "Local partner"),
    cancellationNote: String(data.cancellationNote ?? "Availability is confirmed after the business reviews your request."),
    capacity: nullableNumber(data.capacity),
    categoryIds: stringArray(data.categoryIds),
    cityId: String(data.cityId ?? ""),
    cityName: String(data.cityName ?? "Local city"),
    clickCount: numericValue(data.clickCount),
    currency: "USD",
    description: String(data.description ?? data.shortDescription ?? ""),
    discountPercent: nullableNumber(data.discountPercent),
    durationMinutes: numericValue(data.durationMinutes, 90),
    email: optionalString(data.email),
    featured: data.featured === true,
    groupSize: String(data.groupSize ?? "2-6 people"),
    groupTypes: groupTypes.length ? groupTypes : ["date", "friends"],
    id,
    images: stringArray(data.images),
    indoorOutdoor: data.indoorOutdoor === "outdoor" || data.indoorOutdoor === "either" ? data.indoorOutdoor : "indoor",
    isDemo: data.isDemo === true,
    listingType,
    originalPrice: nullableNumber(data.originalPrice),
    ownerIds: stringArray(data.ownerIds),
    phone: optionalString(data.phone),
    price: numericValue(data.price),
    promoted: data.promoted === true,
    remainingSpots: nullableNumber(data.remainingSpots),
    requestCount: numericValue(data.requestCount),
    saveCount: numericValue(data.saveCount),
    shortDescription: String(data.shortDescription ?? ""),
    slug: String(data.slug ?? id),
    status: listingStatus,
    terms: String(data.terms ?? "Deal is subject to partner confirmation, capacity, and posted terms."),
    title: String(data.title ?? "Local activity deal"),
    vibeTags: vibeTags.length ? vibeTags : ["social"],
    viewCount: numericValue(data.viewCount),
    whyItFits: String(data.whyItFits ?? "A simple last-minute activity deal with open availability.")
  };
}

export type BudgetTier = "free" | "under25" | "under50" | "under100" | "premium";

export type GroupType = "solo" | "date" | "friends" | "family" | "kids";

export type IndoorOutdoor = "indoor" | "outdoor" | "either";

export type ListingType = "deal" | "activity" | "event" | "class" | "experience";

export type PlanWhen = "today" | "tonight" | "tomorrow" | "weekend" | "custom";

export type PlanVibe =
  | "chill"
  | "romantic"
  | "active"
  | "social"
  | "creative"
  | "family-friendly"
  | "adventurous"
  | "low-energy"
  | "rainy-day"
  | "surprise-me";

export type City = {
  active: boolean;
  comingSoon: boolean;
  country: string;
  description: string;
  heroImageUrl: string | null;
  id: string;
  name: string;
  slug: string;
  state: string;
  timezone: string;
};

export type Category = {
  accentColor: string;
  active: boolean;
  description: string;
  icon: string;
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

export type Business = {
  addressLine1: string;
  addressLine2: string | null;
  categories: string[];
  cityId: string;
  country: string;
  description: string;
  email: string;
  id: string;
  instagram: string | null;
  isDemo: boolean;
  latitude: number | null;
  logoUrl: string | null;
  longitude: number | null;
  name: string;
  ownerIds: string[];
  phone: string | null;
  photos: string[];
  postalCode: string;
  slug: string;
  state: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  verificationStatus: "unverified" | "verified";
  website: string | null;
};

export type Listing = {
  approvalStatus: "pending" | "approved" | "rejected";
  availableDays: string[];
  availableFrom: string | null;
  availableSlots: string[];
  availableUntil: string | null;
  bookingMode: "request" | "external_link" | "phone" | "future_checkout";
  bookingUrl: string | null;
  budgetTier: BudgetTier;
  businessId: string;
  businessName: string;
  cancellationNote: string;
  capacity: number | null;
  categoryIds: string[];
  cityId: string;
  cityName: string;
  currency: "USD";
  description: string;
  discountPercent: number | null;
  durationMinutes: number;
  email: string | null;
  featured: boolean;
  groupSize: string;
  groupTypes: GroupType[];
  id: string;
  images: string[];
  indoorOutdoor: IndoorOutdoor;
  isDemo: boolean;
  listingType: ListingType;
  originalPrice: number | null;
  ownerIds: string[];
  phone: string | null;
  price: number;
  promoted: boolean;
  shortDescription: string;
  slug: string;
  status: "draft" | "pending_approval" | "published" | "paused" | "expired";
  terms: string;
  title: string;
  vibeTags: PlanVibe[];
  whyItFits: string;
};

export type PlanFinderInput = {
  budget: BudgetTier | "flexible";
  city: string;
  indoorOutdoor: IndoorOutdoor;
  timeAvailable: "30min" | "1hour" | "2hours" | "half-day" | "evening";
  vibe: PlanVibe;
  when: PlanWhen;
  who: GroupType;
};

export type PlanItem = {
  category: string;
  ctaHref?: string;
  ctaLabel: string;
  description: string;
  estimatedPrice: string;
  listingId?: string;
  time: string;
  title: string;
  whyItFits: string;
};

export type SuggestedPlan = {
  backupSuggestions: string[];
  estimatedTotalBudget: string;
  estimatedTotalTime: string;
  id: string;
  input: PlanFinderInput;
  items: PlanItem[];
  listingIds: string[];
  source: "local_rules" | "ai" | "demo";
  summary: string;
  title: string;
  waitlistRecommended: boolean;
  whyItFits: string;
};

export type BookingRequest = {
  businessId: string;
  businessOwnerIds: string[];
  cityId: string;
  email: string;
  listingId: string;
  message: string;
  name: string;
  partySize: number;
  phone: string | null;
  requestedDate: string;
  requestedTime: string;
  status: "pending" | "contacted" | "confirmed" | "cancelled" | "rejected";
  userId: string;
};

export type PartnerApplication = {
  averagePrice: string;
  businessName: string;
  category: string;
  city: string;
  description: string;
  email: string;
  instagram: string | null;
  message: string;
  offersLastMinuteDeals: boolean;
  ownerName: string;
  phone: string | null;
  status: "new" | "reviewed" | "approved" | "rejected";
  website: string | null;
};

export type GoFunMotionUserProfile = {
  displayName: string;
  email: string | null;
  phone: string | null;
  photoURL: string | null;
  preferredCategories: string[];
  preferredCityId: string | null;
  role: "user" | "business";
};

export type AnalyticsEventName =
  | "hero_cta_click"
  | "plan_generated"
  | "listing_viewed"
  | "listing_saved"
  | "plan_saved"
  | "booking_request_started"
  | "booking_request_submitted"
  | "partner_application_submitted"
  | "waitlist_submitted"
  | "login_clicked";

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
  categories: string[];
  cityId: string;
  description: string;
  id: string;
  isDemo: boolean;
  name: string;
  slug: string;
  status: "pending" | "approved" | "rejected" | "suspended";
};

export type Listing = {
  availableDays: string[];
  availableSlots: string[];
  bookingMode: "request" | "external_link" | "phone" | "future_checkout";
  budgetTier: BudgetTier;
  businessId: string;
  businessName: string;
  cancellationNote: string;
  categoryIds: string[];
  cityId: string;
  cityName: string;
  currency: "USD";
  description: string;
  discountPercent: number | null;
  durationMinutes: number;
  featured: boolean;
  groupTypes: GroupType[];
  id: string;
  images: string[];
  indoorOutdoor: IndoorOutdoor;
  isDemo: boolean;
  listingType: ListingType;
  originalPrice: number | null;
  price: number;
  shortDescription: string;
  slug: string;
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
  description: string;
  estimatedPrice: string;
  listingId?: string;
  time: string;
  title: string;
};

export type SuggestedPlan = {
  id: string;
  input: PlanFinderInput;
  items: PlanItem[];
  listingIds: string[];
  source: "local_rules" | "demo";
  summary: string;
  title: string;
};

export type BookingRequest = {
  businessId: string;
  cityId: string;
  email: string;
  listingId: string;
  message: string;
  name: string;
  partySize: number;
  phone: string | null;
  requestedDate: string;
  requestedTime: string;
};

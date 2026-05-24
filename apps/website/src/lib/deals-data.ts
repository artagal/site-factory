import type {
  BudgetTier,
  Business,
  Category,
  City,
  GroupType,
  IndoorOutdoor,
  Listing,
  PlanFinderInput,
  PlanVibe,
  PlanWhen,
  SuggestedPlan
} from "../types/deals";

export const demoNotice =
  "Demo scaffolding only. These example listings are not production partners or live bookable inventory.";

export const cities: City[] = [
  {
    active: true,
    comingSoon: false,
    country: "US",
    description: "A starter market for testing date nights, group plans, family ideas, and last-minute local deals.",
    id: "las-vegas",
    name: "Las Vegas",
    slug: "las-vegas",
    state: "NV",
    timezone: "America/Los_Angeles"
  },
  {
    active: false,
    comingSoon: true,
    country: "US",
    description: "Coming soon for local activity discovery and partner listings.",
    id: "phoenix",
    name: "Phoenix",
    slug: "phoenix",
    state: "AZ",
    timezone: "America/Phoenix"
  }
];

export const categories: Category[] = [
  {
    accentColor: "#22d3ee",
    active: true,
    description: "Low-pressure plans for couples who want something better than another search tab.",
    icon: "Heart",
    id: "date-night",
    name: "Date Night",
    slug: "date-night",
    sortOrder: 1
  },
  {
    accentColor: "#bef264",
    active: true,
    description: "Fast group-friendly activities that are easy to agree on.",
    icon: "Users",
    id: "friends",
    name: "Friends",
    slug: "friends",
    sortOrder: 2
  },
  {
    accentColor: "#fbbf24",
    active: true,
    description: "Kid-friendly and parent-friendly plans for weekends, rainy days, and school breaks.",
    icon: "Baby",
    id: "family",
    name: "Family",
    slug: "family",
    sortOrder: 3
  },
  {
    accentColor: "#fb7185",
    active: true,
    description: "Classes and workshops for making something with your hands.",
    icon: "Palette",
    id: "creative",
    name: "Creative",
    slug: "creative",
    sortOrder: 4
  },
  {
    accentColor: "#a78bfa",
    active: true,
    description: "Active plans, movement, classes, and playful competition.",
    icon: "Zap",
    id: "active",
    name: "Active",
    slug: "active",
    sortOrder: 5
  },
  {
    accentColor: "#34d399",
    active: true,
    description: "Indoor options for hot days, rainy days, and low-planning evenings.",
    icon: "Umbrella",
    id: "rainy-day",
    name: "Rainy Day",
    slug: "rainy-day",
    sortOrder: 6
  }
];

export const businesses: Business[] = [
  {
    categories: ["date-night", "creative"],
    cityId: "las-vegas",
    description: "Demo pottery studio profile for local deal UX testing.",
    id: "demo-clay-room",
    isDemo: true,
    name: "Demo Clay Room",
    slug: "demo-clay-room",
    status: "approved"
  },
  {
    categories: ["friends", "active"],
    cityId: "las-vegas",
    description: "Demo escape-room profile for last-minute slot testing.",
    id: "demo-lockbox-games",
    isDemo: true,
    name: "Demo Lockbox Games",
    slug: "demo-lockbox-games",
    status: "approved"
  },
  {
    categories: ["family", "rainy-day"],
    cityId: "las-vegas",
    description: "Demo indoor play profile for family plan testing.",
    id: "demo-indoor-play-lab",
    isDemo: true,
    name: "Demo Indoor Play Lab",
    slug: "demo-indoor-play-lab",
    status: "approved"
  }
];

export const listings: Listing[] = [
  {
    availableDays: ["today", "tomorrow", "weekend"],
    availableSlots: ["6:00 PM", "7:30 PM"],
    bookingMode: "request",
    budgetTier: "under50",
    businessId: "demo-clay-room",
    businessName: "Demo Clay Room",
    cancellationNote: "Demo cancellation note. Partner terms will be configured when real businesses are approved.",
    categoryIds: ["date-night", "creative"],
    cityId: "las-vegas",
    cityName: "Las Vegas",
    currency: "USD",
    description:
      "A hands-on pottery night designed for a relaxed date or creative friend hang. Includes guided wheel time and a simple glaze option.",
    discountPercent: 25,
    durationMinutes: 90,
    featured: true,
    groupTypes: ["date", "friends"],
    id: "pottery-date-night-demo",
    images: [],
    indoorOutdoor: "indoor",
    isDemo: true,
    listingType: "class",
    originalPrice: 60,
    price: 45,
    shortDescription: "Creative indoor date night with a demo 25% off deal.",
    slug: "pottery-date-night-demo",
    terms: "Demo terms only. No live purchase or booking is available.",
    title: "Pottery Date Night - 25% Off",
    vibeTags: ["romantic", "creative", "chill", "rainy-day"],
    whyItFits: "Hands-on, easy to talk during, and clear enough for a last-minute plan."
  },
  {
    availableDays: ["today", "tonight", "weekend"],
    availableSlots: ["8:00 PM", "9:15 PM"],
    bookingMode: "request",
    budgetTier: "under25",
    businessId: "demo-lockbox-games",
    businessName: "Demo Lockbox Games",
    cancellationNote: "Demo cancellation note. Real partner policies will appear on approved listings.",
    categoryIds: ["friends", "active"],
    cityId: "las-vegas",
    cityName: "Las Vegas",
    currency: "USD",
    description:
      "A short escape-room slot for groups that want an activity with a clear start, finish, and shared story afterward.",
    discountPercent: 30,
    durationMinutes: 60,
    featured: true,
    groupTypes: ["friends", "date"],
    id: "escape-room-last-minute-demo",
    images: [],
    indoorOutdoor: "indoor",
    isDemo: true,
    listingType: "deal",
    originalPrice: 32,
    price: 22,
    shortDescription: "Last-minute indoor group plan with a demo discount.",
    slug: "escape-room-last-minute-demo",
    terms: "Demo terms only. No live purchase or booking is available.",
    title: "Escape Room - Last-Minute Slot",
    vibeTags: ["active", "social", "adventurous", "rainy-day"],
    whyItFits: "Good for friends who need a decision fast and want something more memorable than dinner."
  },
  {
    availableDays: ["tomorrow", "weekend"],
    availableSlots: ["10:00 AM", "1:00 PM", "3:00 PM"],
    bookingMode: "request",
    budgetTier: "under25",
    businessId: "demo-indoor-play-lab",
    businessName: "Demo Indoor Play Lab",
    cancellationNote: "Demo cancellation note. Approved partners will provide the real policy.",
    categoryIds: ["family", "rainy-day"],
    cityId: "las-vegas",
    cityName: "Las Vegas",
    currency: "USD",
    description:
      "A simple indoor play session for families who need a weather-proof plan and enough structure to make the day easier.",
    discountPercent: 20,
    durationMinutes: 120,
    featured: false,
    groupTypes: ["family", "kids"],
    id: "kids-indoor-play-weekend-demo",
    images: [],
    indoorOutdoor: "indoor",
    isDemo: true,
    listingType: "activity",
    originalPrice: 25,
    price: 20,
    shortDescription: "Weekend family activity with a demo kids deal.",
    slug: "kids-indoor-play-weekend-demo",
    terms: "Demo terms only. No live purchase or booking is available.",
    title: "Kids Indoor Play - Weekend",
    vibeTags: ["family-friendly", "low-energy", "rainy-day"],
    whyItFits: "Indoor, predictable, and built around kids having room to move."
  },
  {
    availableDays: ["today", "tonight"],
    availableSlots: ["7:00 PM", "8:30 PM"],
    bookingMode: "request",
    budgetTier: "under50",
    businessId: "demo-lockbox-games",
    businessName: "Demo Lockbox Games",
    cancellationNote: "Demo cancellation note. Real partner policies will appear on approved listings.",
    categoryIds: ["date-night", "friends", "active"],
    cityId: "las-vegas",
    cityName: "Las Vegas",
    currency: "USD",
    description:
      "A compact mini golf plan for pairs or small groups who want light competition without a full-night commitment.",
    discountPercent: 15,
    durationMinutes: 75,
    featured: false,
    groupTypes: ["date", "friends", "family"],
    id: "mini-golf-friends-plan-demo",
    images: [],
    indoorOutdoor: "either",
    isDemo: true,
    listingType: "activity",
    originalPrice: 28,
    price: 24,
    shortDescription: "Easy group activity with a demo last-minute price.",
    slug: "mini-golf-friends-plan-demo",
    terms: "Demo terms only. No live purchase or booking is available.",
    title: "Mini Golf - Friends Plan",
    vibeTags: ["social", "active", "chill", "romantic"],
    whyItFits: "Casual, social, and works even when nobody wants to over-plan."
  }
];

const defaultInput: PlanFinderInput = {
  budget: "under50",
  city: "Las Vegas",
  indoorOutdoor: "either",
  timeAvailable: "2hours",
  vibe: "surprise-me",
  when: "today",
  who: "date"
};

export function getListingBySlug(slug: string) {
  return listings.find((listing) => listing.slug === slug);
}

export function getCategoryById(id: string) {
  return categories.find((category) => category.id === id);
}

export function getBusinessById(id: string) {
  return businesses.find((business) => business.id === id);
}

export function getFeaturedListings() {
  return listings.filter((listing) => listing.featured).slice(0, 3);
}

export function parsePlanFinderInput(searchParams: Record<string, string | string[] | undefined> = {}): PlanFinderInput {
  const read = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return {
    budget: parseOption(read("budget"), ["free", "under25", "under50", "under100", "premium", "flexible"], defaultInput.budget),
    city: read("city") || defaultInput.city,
    indoorOutdoor: parseOption(read("indoorOutdoor"), ["indoor", "outdoor", "either"], defaultInput.indoorOutdoor),
    timeAvailable: parseOption(read("timeAvailable"), ["30min", "1hour", "2hours", "half-day", "evening"], defaultInput.timeAvailable),
    vibe: parseOption(
      read("vibe"),
      ["chill", "romantic", "active", "social", "creative", "family-friendly", "adventurous", "low-energy", "rainy-day", "surprise-me"],
      defaultInput.vibe
    ),
    when: parseOption(read("when"), ["today", "tonight", "tomorrow", "weekend", "custom"], defaultInput.when),
    who: parseOption(read("who"), ["solo", "date", "friends", "family", "kids"], defaultInput.who)
  };
}

export function filterListings(input: Partial<PlanFinderInput> & { categoryId?: string }) {
  return listings.filter((listing) => {
    const cityMatches = !input.city || listing.cityName.toLowerCase().includes(input.city.toLowerCase());
    const whoMatches = !input.who || listing.groupTypes.includes(input.who);
    const budgetMatches = !input.budget || input.budget === "flexible" || listing.budgetTier === input.budget;
    const vibeMatches = !input.vibe || input.vibe === "surprise-me" || listing.vibeTags.includes(input.vibe);
    const indoorMatches = !input.indoorOutdoor || input.indoorOutdoor === "either" || listing.indoorOutdoor === input.indoorOutdoor || listing.indoorOutdoor === "either";
    const whenMatches = !input.when || listing.availableDays.includes(input.when);
    const categoryMatches = !input.categoryId || listing.categoryIds.includes(input.categoryId);

    return cityMatches && whoMatches && budgetMatches && vibeMatches && indoorMatches && whenMatches && categoryMatches;
  });
}

export function buildSuggestedPlan(input: PlanFinderInput): SuggestedPlan {
  const matches = filterListings(input);
  const fallback = matches.length ? matches : filterListings({ city: input.city, who: input.who }).concat(listings).slice(0, 3);
  const selected = [...new Map(fallback.map((listing) => [listing.id, listing])).values()].slice(0, 3);
  const first = selected[0] ?? listings[0];

  return {
    id: `demo-plan-${input.city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${input.when}-${input.who}`,
    input,
    items: [
      {
        description: `Start with a ${formatVibe(input.vibe)} option that fits ${formatGroup(input.who)} and ${formatWhen(input.when)}.`,
        estimatedPrice: formatPrice(first.price),
        listingId: first.id,
        time: formatDuration(first.durationMinutes),
        title: first.title
      },
      {
        description: "Keep a backup nearby so the plan still works if the first option is full.",
        estimatedPrice: selected[1] ? formatPrice(selected[1].price) : "Flexible",
        listingId: selected[1]?.id,
        time: selected[1] ? formatDuration(selected[1].durationMinutes) : "60-90 min",
        title: selected[1]?.title ?? "Backup local activity"
      },
      {
        description: "Send the shortlist to the group and choose the slot that gets the fastest yes.",
        estimatedPrice: selected[2] ? formatPrice(selected[2].price) : "Varies",
        listingId: selected[2]?.id,
        time: selected[2] ? formatDuration(selected[2].durationMinutes) : "Your call",
        title: selected[2]?.title ?? "Shareable plan note"
      }
    ],
    listingIds: selected.map((listing) => listing.id),
    source: "demo",
    summary: `A ${formatWhen(input.when)} plan in ${input.city} for ${formatGroup(input.who)}, tuned for ${formatVibe(input.vibe)} energy and ${formatBudget(input.budget)}.`,
    title: `${input.city} ${formatGroup(input.who)} plan for ${formatWhen(input.when)}`
  };
}

function parseOption<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function formatBudget(budget: BudgetTier | "flexible") {
  const labels: Record<BudgetTier | "flexible", string> = {
    flexible: "flexible budget",
    free: "free",
    premium: "premium",
    under100: "under $100",
    under25: "under $25",
    under50: "under $50"
  };
  return labels[budget];
}

export function formatGroup(group: GroupType) {
  const labels: Record<GroupType, string> = {
    date: "date night",
    family: "family",
    friends: "friends",
    kids: "kids",
    solo: "solo"
  };
  return labels[group];
}

export function formatIndoorOutdoor(value: IndoorOutdoor) {
  return value === "either" ? "Indoor or outdoor" : value[0].toUpperCase() + value.slice(1);
}

export function formatPrice(price: number) {
  return price === 0 ? "Free" : `$${price}`;
}

export function formatVibe(vibe: PlanVibe) {
  return vibe.replace(/-/g, " ");
}

export function formatWhen(when: PlanWhen) {
  const labels: Record<PlanWhen, string> = {
    custom: "your chosen date",
    today: "today",
    tomorrow: "tomorrow",
    tonight: "tonight",
    weekend: "this weekend"
  };
  return labels[when];
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hr` : `${hours.toFixed(1)} hr`;
}

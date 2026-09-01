import type { Business, Category, City, Listing } from "../types/deals";

export const demoNotice =
  "Demo examples are clearly labeled and never treated as real partners. Only reviewed live deals accept booking requests.";

export const demoCities: City[] = [
  {
    active: true,
    comingSoon: false,
    country: "US",
    description: "A starter market for testing date nights, group plans, family ideas, and last-minute local deals.",
    heroImageUrl: null,
    id: "miami",
    name: "Miami",
    slug: "miami",
    state: "FL",
    timezone: "America/New_York"
  },
  {
    active: true,
    comingSoon: false,
    country: "US",
    description: "Demo activity discovery for classes, deals, group plans, and last-minute local experiences.",
    heroImageUrl: null,
    id: "los-angeles",
    name: "Los Angeles",
    slug: "los-angeles",
    state: "CA",
    timezone: "America/Los_Angeles"
  },
  {
    active: true,
    comingSoon: false,
    country: "US",
    description: "Local plans for date nights, family weekends, events, and spontaneous fun.",
    heroImageUrl: null,
    id: "new-york",
    name: "New York",
    slug: "new-york",
    state: "NY",
    timezone: "America/New_York"
  },
  {
    active: true,
    comingSoon: false,
    country: "US",
    description: "A fast-growing test market for activities, classes, live events, and local deals.",
    heroImageUrl: null,
    id: "austin",
    name: "Austin",
    slug: "austin",
    state: "TX",
    timezone: "America/Chicago"
  },
  {
    active: true,
    comingSoon: false,
    country: "US",
    description: "Coastal plans, family activities, outdoor ideas, and local classes.",
    heroImageUrl: null,
    id: "san-diego",
    name: "San Diego",
    slug: "san-diego",
    state: "CA",
    timezone: "America/Los_Angeles"
  }
];

export const demoCategories: Category[] = [
  { accentColor: "#fb7185", active: true, description: "Date ideas, romantic plans, and low-pressure couples activities.", icon: "Heart", id: "date-night", name: "Date Night", slug: "date-night", sortOrder: 1 },
  { accentColor: "#bef264", active: true, description: "Group-friendly ideas that are easy to agree on.", icon: "Users", id: "friends", name: "Friends", slug: "friends", sortOrder: 2 },
  { accentColor: "#fbbf24", active: true, description: "Kid-friendly and parent-friendly local activities.", icon: "Baby", id: "family", name: "Family", slug: "family", sortOrder: 3 },
  { accentColor: "#facc15", active: true, description: "Play spaces, classes, and weekend plans for kids.", icon: "Puzzle", id: "kids", name: "Kids", slug: "kids", sortOrder: 4 },
  { accentColor: "#a78bfa", active: true, description: "Fitness studios, movement classes, and active plans.", icon: "Dumbbell", id: "fitness", name: "Fitness", slug: "fitness", sortOrder: 5 },
  { accentColor: "#fb7185", active: true, description: "Workshops, pottery, dance, cooking, and hands-on experiences.", icon: "Palette", id: "creative", name: "Creative", slug: "creative", sortOrder: 6 },
  { accentColor: "#f97316", active: true, description: "Food events, tasting plans, coffee walks, and casual bites.", icon: "Utensils", id: "food-drink", name: "Food & Drink", slug: "food-drink", sortOrder: 7 },
  { accentColor: "#c084fc", active: true, description: "Comedy, music, open mics, dancing, and evening plans.", icon: "Mic", id: "nightlife", name: "Nightlife", slug: "nightlife", sortOrder: 8 },
  { accentColor: "#22d3ee", active: true, description: "Parks, walks, waterfront ideas, tours, and active outdoor plans.", icon: "Trees", id: "outdoor", name: "Outdoor", slug: "outdoor", sortOrder: 9 },
  { accentColor: "#34d399", active: true, description: "Yoga, spa, wellness, low-energy, and reset plans.", icon: "Leaf", id: "wellness", name: "Wellness", slug: "wellness", sortOrder: 10 },
  { accentColor: "#38bdf8", active: true, description: "Trial classes, learning experiences, and skill-building activities.", icon: "GraduationCap", id: "classes", name: "Classes", slug: "classes", sortOrder: 11 },
  { accentColor: "#f472b6", active: true, description: "Comedy nights, pop-ups, workshops, and time-specific events.", icon: "Calendar", id: "events", name: "Events", slug: "events", sortOrder: 12 }
];

type DemoBusinessInput = {
  categories: string[];
  cityId: string;
  description: string;
  id: string;
  latitude: number;
  longitude: number;
  name: string;
};

function createDemoBusiness(input: DemoBusinessInput): Business {
  const city = demoCities.find((item) => item.id === input.cityId);
  if (!city) throw new Error(`Unknown demo city: ${input.cityId}`);

  return {
    addressLine1: "Approximate demo location",
    addressLine2: null,
    categories: input.categories,
    cityId: city.id,
    cityName: city.name,
    country: city.country,
    description: input.description,
    email: `${input.id}@gofunmotion.test`,
    id: input.id,
    instagram: null,
    isDemo: true,
    latitude: input.latitude,
    logoUrl: null,
    longitude: input.longitude,
    name: input.name,
    ownerIds: [`demo-owner-${input.id}`],
    phone: null,
    photos: [],
    postalCode: "00000",
    slug: input.id,
    state: city.state,
    status: "approved",
    verificationStatus: "unverified",
    website: null
  };
}

export const demoBusinesses: Business[] = [
  createDemoBusiness({ categories: ["date-night", "creative", "classes"], cityId: "miami", description: "Demo pottery and creative workshop studio for marketplace testing.", id: "demo-clay-house", latitude: 25.7915, longitude: -80.1356, name: "Demo Clay House" }),
  createDemoBusiness({ categories: ["outdoor", "wellness", "friends"], cityId: "miami", description: "Demo waterfront activity provider with short-notice outdoor openings.", id: "demo-bay-paddle-club", latitude: 25.7836, longitude: -80.1901, name: "Demo Bay Paddle Club" }),
  createDemoBusiness({ categories: ["date-night", "friends", "family"], cityId: "los-angeles", description: "Demo indoor mini-golf venue with late evening openings.", id: "demo-neon-putt", latitude: 34.1016, longitude: -118.3267, name: "Demo Neon Putt" }),
  createDemoBusiness({ categories: ["nightlife", "events", "date-night"], cityId: "los-angeles", description: "Demo comedy room for rush tickets and open seats.", id: "demo-sunset-comedy-room", latitude: 34.0983, longitude: -118.3295, name: "Demo Sunset Comedy Room" }),
  createDemoBusiness({ categories: ["classes", "fitness", "nightlife"], cityId: "new-york", description: "Demo Brooklyn dance studio with beginner-friendly evening classes.", id: "demo-brooklyn-dance-lab", latitude: 40.718, longitude: -73.958, name: "Demo Brooklyn Dance Lab" }),
  createDemoBusiness({ categories: ["nightlife", "events", "friends"], cityId: "new-york", description: "Demo improv venue offering last-minute seats for live shows.", id: "demo-manhattan-improv", latitude: 40.761, longitude: -73.985, name: "Demo Manhattan Improv" }),
  createDemoBusiness({ categories: ["friends", "events", "date-night"], cityId: "austin", description: "Demo escape-room venue for time-specific group openings.", id: "demo-lockbox-games", latitude: 30.2676, longitude: -97.7429, name: "Demo Lockbox Games" }),
  createDemoBusiness({ categories: ["friends", "nightlife", "events"], cityId: "austin", description: "Demo social venue with bowling, games, and slow-hour offers.", id: "demo-eastside-social", latitude: 30.2614, longitude: -97.7146, name: "Demo Eastside Social" }),
  createDemoBusiness({ categories: ["family", "kids", "creative"], cityId: "san-diego", description: "Demo indoor play and workshop venue for family plan testing.", id: "demo-indoor-play-lab", latitude: 32.733, longitude: -117.148, name: "Demo Indoor Play Lab" }),
  createDemoBusiness({ categories: ["wellness", "fitness", "outdoor"], cityId: "san-diego", description: "Demo yoga and wellness studio with short-notice class spaces.", id: "demo-harbor-yoga", latitude: 32.711, longitude: -117.161, name: "Demo Harbor Yoga" })
];

type DemoListingInput = {
  availableDays: string[];
  availableSlots: string[];
  businessId: string;
  capacity: number;
  categoryIds: string[];
  description: string;
  durationMinutes: number;
  featured?: boolean;
  groupSize: string;
  groupTypes: Listing["groupTypes"];
  id: string;
  indoorOutdoor: Listing["indoorOutdoor"];
  listingType: Listing["listingType"];
  originalPrice: number;
  price: number;
  promoted?: boolean;
  remainingSpots: number;
  shortDescription: string;
  title: string;
  vibeTags: Listing["vibeTags"];
  whyItFits: string;
};

function budgetTierFor(price: number): Listing["budgetTier"] {
  if (price === 0) return "free";
  if (price <= 25) return "under25";
  if (price <= 50) return "under50";
  if (price <= 100) return "under100";
  return "premium";
}

function createDemoListing(input: DemoListingInput): Listing {
  const business = demoBusinesses.find((item) => item.id === input.businessId);
  if (!business?.cityName) throw new Error(`Unknown demo business: ${input.businessId}`);

  return {
    approvalStatus: "approved",
    availableDays: input.availableDays,
    availableFrom: null,
    availableSlots: input.availableSlots,
    availableUntil: null,
    bookingMode: "request",
    bookingUrl: null,
    budgetTier: budgetTierFor(input.price),
    businessId: business.id,
    businessName: business.name,
    cancellationNote: "Demo policy only. A real partner would confirm availability and cancellation terms.",
    capacity: input.capacity,
    categoryIds: input.categoryIds,
    cityId: business.cityId,
    cityName: business.cityName,
    clickCount: 0,
    currency: "USD",
    description: input.description,
    discountPercent: Math.round((1 - input.price / input.originalPrice) * 100),
    durationMinutes: input.durationMinutes,
    email: null,
    featured: input.featured ?? false,
    groupSize: input.groupSize,
    groupTypes: input.groupTypes,
    id: input.id,
    images: [],
    indoorOutdoor: input.indoorOutdoor,
    isDemo: true,
    listingType: input.listingType,
    originalPrice: input.originalPrice,
    ownerIds: business.ownerIds,
    phone: null,
    price: input.price,
    promoted: input.promoted ?? false,
    remainingSpots: input.remainingSpots,
    requestCount: 0,
    saveCount: 0,
    shortDescription: input.shortDescription,
    slug: input.id,
    status: "published",
    terms: "Demo only. This example cannot be booked or purchased.",
    title: input.title,
    vibeTags: input.vibeTags,
    viewCount: 0,
    whyItFits: input.whyItFits
  };
}

export const demoListings: Listing[] = [
  createDemoListing({ availableDays: ["today", "tonight", "weekend"], availableSlots: ["6:00 PM", "7:30 PM"], businessId: "demo-clay-house", capacity: 12, categoryIds: ["date-night", "creative", "classes"], description: "A guided pottery session for a relaxed date or creative friend hang, with wheel time and a simple glaze option.", durationMinutes: 90, featured: true, groupSize: "2-8", groupTypes: ["date", "friends"], id: "pottery-date-night-demo", indoorOutdoor: "indoor", listingType: "class", originalPrice: 60, price: 39, remainingSpots: 2, shortDescription: "Two late seats for a low-pressure creative night.", title: "Pottery Date Night - Tonight", vibeTags: ["romantic", "creative", "chill", "rainy-day"], whyItFits: "Hands-on, easy to talk during, and ready for a last-minute plan." }),
  createDemoListing({ availableDays: ["today", "tonight"], availableSlots: ["5:30 PM", "6:45 PM"], businessId: "demo-bay-paddle-club", capacity: 10, categoryIds: ["outdoor", "wellness", "friends"], description: "A short guided waterfront paddle scheduled around sunset with basic equipment included in this demo offer.", durationMinutes: 75, featured: true, groupSize: "1-6", groupTypes: ["solo", "date", "friends"], id: "miami-sunset-paddle-demo", indoorOutdoor: "outdoor", listingType: "experience", originalPrice: 55, price: 29, remainingSpots: 4, shortDescription: "Sunset water time with four demo spots left.", title: "Sunset Paddle - Open Spots", vibeTags: ["adventurous", "active", "romantic"], whyItFits: "A time-specific outdoor plan with a clear start and finish." }),
  createDemoListing({ availableDays: ["tonight", "tomorrow", "weekend"], availableSlots: ["7:00 PM", "8:30 PM"], businessId: "demo-clay-house", capacity: 16, categoryIds: ["creative", "friends", "events"], description: "A casual guided painting workshop designed for small groups and beginners who want a social indoor activity.", durationMinutes: 75, groupSize: "2-10", groupTypes: ["date", "friends"], id: "miami-glow-painting-demo", indoorOutdoor: "indoor", listingType: "event", originalPrice: 48, price: 28, remainingSpots: 5, shortDescription: "A colorful indoor workshop with evening availability.", title: "Glow Painting Workshop", vibeTags: ["creative", "social", "rainy-day"], whyItFits: "Works for groups who want conversation plus something tangible to take home." }),

  createDemoListing({ availableDays: ["today", "tonight"], availableSlots: ["7:00 PM", "8:30 PM"], businessId: "demo-neon-putt", capacity: 18, categoryIds: ["date-night", "friends", "family"], description: "A compact neon mini-golf round for pairs or small groups who want light competition without a full-night commitment.", durationMinutes: 75, featured: true, groupSize: "2-8", groupTypes: ["date", "friends", "family"], id: "mini-golf-friends-plan-demo", indoorOutdoor: "indoor", listingType: "activity", originalPrice: 28, price: 19, remainingSpots: 4, shortDescription: "Late mini-golf entry with four demo spots left.", title: "Neon Mini Golf - Tonight", vibeTags: ["social", "active", "chill", "romantic"], whyItFits: "Casual, social, and easy to choose when nobody wants to over-plan." }),
  createDemoListing({ availableDays: ["today", "tonight", "weekend"], availableSlots: ["8:00 PM", "9:30 PM"], businessId: "demo-sunset-comedy-room", capacity: 80, categoryIds: ["nightlife", "events", "date-night"], description: "Demo rush tickets for a local stand-up showcase with seating confirmed only after a request.", durationMinutes: 90, featured: true, groupSize: "1-6", groupTypes: ["solo", "date", "friends"], id: "la-comedy-rush-demo", indoorOutdoor: "indoor", listingType: "event", originalPrice: 40, price: 18, promoted: true, remainingSpots: 6, shortDescription: "Last-minute comedy seats at less than half the sample price.", title: "Comedy Night Rush Tickets", vibeTags: ["social", "chill", "romantic"], whyItFits: "A ready-made evening plan that requires almost no coordination." }),
  createDemoListing({ availableDays: ["tonight", "weekend"], availableSlots: ["10:00 PM"], businessId: "demo-sunset-comedy-room", capacity: 60, categoryIds: ["nightlife", "events", "friends"], description: "A late improv show example for people who want a spontaneous second stop after dinner.", durationMinutes: 70, groupSize: "1-8", groupTypes: ["solo", "date", "friends"], id: "la-late-improv-demo", indoorOutdoor: "indoor", listingType: "event", originalPrice: 25, price: 12, remainingSpots: 8, shortDescription: "A low-cost late show with sample rush availability.", title: "Late Improv Show - Rush Seats", vibeTags: ["social", "adventurous", "low-energy"], whyItFits: "Short, inexpensive, and easy to add to an existing night out." }),

  createDemoListing({ availableDays: ["today", "tonight", "tomorrow"], availableSlots: ["6:30 PM", "8:00 PM"], businessId: "demo-brooklyn-dance-lab", capacity: 20, categoryIds: ["classes", "fitness", "nightlife"], description: "A beginner-friendly salsa trial class for people who want a social plan with movement and music.", durationMinutes: 60, featured: true, groupSize: "1-20", groupTypes: ["solo", "date", "friends"], id: "salsa-trial-class-demo", indoorOutdoor: "indoor", listingType: "class", originalPrice: 26, price: 12, remainingSpots: 6, shortDescription: "Beginner dance trial with six demo spaces tonight.", title: "Salsa Trial Class - Tonight", vibeTags: ["social", "active", "adventurous"], whyItFits: "A low-commitment social activity for solo visitors, dates, or friends." }),
  createDemoListing({ availableDays: ["tonight", "weekend"], availableSlots: ["7:45 PM", "9:15 PM"], businessId: "demo-manhattan-improv", capacity: 90, categoryIds: ["nightlife", "events", "friends"], description: "A fast-paced improv show example with a small block of same-day seats.", durationMinutes: 80, featured: true, groupSize: "1-8", groupTypes: ["solo", "date", "friends"], id: "nyc-improv-rush-demo", indoorOutdoor: "indoor", listingType: "event", originalPrice: 35, price: 16, remainingSpots: 5, shortDescription: "Same-day live comedy seats in Midtown.", title: "Improv Rush Seats", vibeTags: ["social", "chill", "rainy-day"], whyItFits: "Central, time-specific, and simple for groups that cannot settle on a plan." }),
  createDemoListing({ availableDays: ["today", "tonight", "weekend"], availableSlots: ["8:30 PM"], businessId: "demo-brooklyn-dance-lab", capacity: 24, categoryIds: ["classes", "date-night", "friends"], description: "A paired bachata session followed by a short practice mixer in this non-bookable demo example.", durationMinutes: 90, groupSize: "1-16", groupTypes: ["solo", "date", "friends"], id: "brooklyn-bachata-mixer-demo", indoorOutdoor: "indoor", listingType: "class", originalPrice: 35, price: 20, remainingSpots: 7, shortDescription: "A social dance class plus mixer with open sample spaces.", title: "Bachata Class + Social Mixer", vibeTags: ["romantic", "social", "active"], whyItFits: "Combines a structured lesson with enough social time to make the night feel complete." }),

  createDemoListing({ availableDays: ["today", "tonight", "weekend"], availableSlots: ["8:00 PM", "9:15 PM"], businessId: "demo-lockbox-games", capacity: 8, categoryIds: ["friends", "events", "date-night"], description: "A private escape-room opening for groups that want a clear start, finish, and shared story afterward.", durationMinutes: 60, featured: true, groupSize: "2-6", groupTypes: ["friends", "date"], id: "escape-room-last-minute-demo", indoorOutdoor: "indoor", listingType: "deal", originalPrice: 90, price: 39, promoted: true, remainingSpots: 1, shortDescription: "One sample room opening at a deep last-minute discount.", title: "Escape Room - 8:00 PM Slot", vibeTags: ["active", "social", "adventurous", "rainy-day"], whyItFits: "A memorable group plan with one decision and a fixed start time." }),
  createDemoListing({ availableDays: ["today", "tonight"], availableSlots: ["6:45 PM", "8:15 PM"], businessId: "demo-eastside-social", capacity: 24, categoryIds: ["friends", "nightlife", "events"], description: "A one-hour bowling-lane example for a slow window that begins soon.", durationMinutes: 60, featured: true, groupSize: "2-6", groupTypes: ["date", "friends", "family"], id: "austin-bowling-lane-demo", indoorOutdoor: "indoor", listingType: "deal", originalPrice: 60, price: 25, remainingSpots: 1, shortDescription: "One demo lane available in the next slow window.", title: "Bowling Lane - Open in One Hour", vibeTags: ["social", "active", "family-friendly"], whyItFits: "Everyone understands the plan, and the sample lane is already time-boxed." }),
  createDemoListing({ availableDays: ["tonight", "weekend"], availableSlots: ["9:00 PM"], businessId: "demo-eastside-social", capacity: 50, categoryIds: ["nightlife", "events", "friends"], description: "A casual open-mic and game-night example with discounted same-day entry.", durationMinutes: 120, groupSize: "1-10", groupTypes: ["solo", "date", "friends"], id: "austin-open-mic-games-demo", indoorOutdoor: "indoor", listingType: "event", originalPrice: 22, price: 10, remainingSpots: 12, shortDescription: "Late social plan with games and a live open mic.", title: "Open Mic + Game Night", vibeTags: ["social", "creative", "chill"], whyItFits: "Flexible enough for a group and inexpensive enough for a spontaneous decision." }),

  createDemoListing({ availableDays: ["today", "tomorrow", "weekend"], availableSlots: ["10:00 AM", "1:00 PM", "3:00 PM"], businessId: "demo-indoor-play-lab", capacity: 30, categoryIds: ["family", "kids"], description: "A weather-proof indoor play session for families who want an easy weekday or weekend plan.", durationMinutes: 120, featured: true, groupSize: "2-6", groupTypes: ["family", "kids"], id: "kids-indoor-play-weekend-demo", indoorOutdoor: "indoor", listingType: "activity", originalPrice: 25, price: 10, remainingSpots: 8, shortDescription: "Discounted family play session with sample availability.", title: "Kids Indoor Play - Slow Slot", vibeTags: ["family-friendly", "low-energy", "rainy-day"], whyItFits: "Indoor, predictable, and built around kids having room to move." }),
  createDemoListing({ availableDays: ["today", "tonight", "weekend"], availableSlots: ["5:45 PM", "7:00 PM"], businessId: "demo-harbor-yoga", capacity: 18, categoryIds: ["wellness", "fitness", "classes"], description: "A beginner-friendly studio yoga class example with mats available and a short-notice trial rate.", durationMinutes: 60, featured: true, groupSize: "1-4", groupTypes: ["solo", "date", "friends"], id: "san-diego-yoga-trial-demo", indoorOutdoor: "indoor", listingType: "class", originalPrice: 30, price: 12, remainingSpots: 10, shortDescription: "Ten sample trial spaces in an early evening class.", title: "Harbor Yoga Trial Class", vibeTags: ["chill", "low-energy", "rainy-day"], whyItFits: "A calm, low-cost reset that works even when energy is limited." }),
  createDemoListing({ availableDays: ["tomorrow", "weekend"], availableSlots: ["11:00 AM", "2:00 PM"], businessId: "demo-indoor-play-lab", capacity: 20, categoryIds: ["family", "kids", "creative"], description: "A hands-on science workshop example for families, with simple experiments and take-home activity sheets.", durationMinutes: 75, groupSize: "2-6", groupTypes: ["family", "kids"], id: "san-diego-family-science-demo", indoorOutdoor: "indoor", listingType: "class", originalPrice: 40, price: 22, remainingSpots: 6, shortDescription: "A compact family workshop for the weekend.", title: "Family Science Workshop", vibeTags: ["family-friendly", "creative", "rainy-day"], whyItFits: "Structured enough for parents and interactive enough to keep kids engaged." })
];

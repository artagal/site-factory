import { demoBusinesses, demoCategories, demoCities, demoListings } from "./demoData";
import { isDemoDataEnabled } from "./demo-mode";
import { canReadApprovedBusiness, canReadPublishedListing } from "./permissions";
import { findCityOption } from "./cities";
import { isOpenListing, listingDiscountPercent } from "./listing-presentation";
import { slugify } from "./slug";
import type { Listing, PlanFinderInput } from "../types/deals";

export type ListingSort =
  | "featured"
  | "tonight"
  | "biggest-discount"
  | "under25"
  | "family-friendly"
  | "date-night"
  | "newest";

export type ListingSearchInput = Partial<PlanFinderInput> & {
  availability?: string;
  categoryId?: string;
  citySlug?: string;
  discountOnly?: boolean;
  maxDistance?: string;
  minRating?: string;
  maxPrice?: number;
  sort?: ListingSort;
};

// Browsing must not inherit the planner's date-night, city, or budget defaults.
export function parseListingSearchInput(params: Record<string, string | string[] | undefined>): ListingSearchInput {
  const read = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  };
  const option = <T extends string>(key: string, values: readonly T[]) => {
    const value = read(key);
    return values.includes(value as T) ? value as T : undefined;
  };
  const cityId = read("cityId") || read("citySlug");
  const city = findCityOption(cityId || read("city"));
  const maxPrice = Number(read("maxPrice"));
  return {
    cityId: city?.id ?? (cityId ? slugify(cityId) : undefined),
    city: city?.name ?? (cityId ? undefined : read("city") || undefined),
    categoryId: read("categoryId") || read("category") || undefined,
    budget: option("budget", ["free", "under25", "under50", "under100", "premium", "flexible"] as const),
    when: option("when", ["today", "tonight", "tomorrow", "weekend"] as const),
    who: option("who", ["solo", "date", "friends", "family", "kids"] as const),
    vibe: option("vibe", ["chill", "romantic", "active", "social", "creative", "family-friendly", "adventurous", "low-energy", "rainy-day", "surprise-me"] as const),
    indoorOutdoor: option("indoorOutdoor", ["indoor", "outdoor", "either"] as const),
    discountOnly: read("discount") === "true" || read("discountOnly") === "true",
    maxPrice: read("maxPrice") && Number.isFinite(maxPrice) && maxPrice >= 0 ? maxPrice : undefined,
    sort: option("sort", ["featured", "tonight", "biggest-discount", "under25", "family-friendly", "date-night", "newest"] as const) ?? "tonight"
  };
}

export function getPublishedListings() {
  return isDemoDataEnabled() ? demoListings.filter(canReadPublishedListing) : [];
}

export function getListingBySlug(slug: string) {
  return getPublishedListings().find((listing) => listing.slug === slug);
}

export function getCategoryById(id: string) {
  return demoCategories.find((category) => category.id === id);
}

export function getCategoryBySlug(slug: string) {
  return demoCategories.find((category) => category.slug === slug);
}

export function getCityBySlug(slug: string) {
  return demoCities.find((city) => city.slug === slug);
}

export function getBusinessById(id: string) {
  if (!isDemoDataEnabled()) return undefined;
  const business = demoBusinesses.find((item) => item.id === id);
  return business && canReadApprovedBusiness(business) ? business : undefined;
}

export function getFeaturedListings() {
  return sortListings(getPublishedListings().filter((listing) => listing.featured), "featured").slice(0, 4);
}

export function filterListings(input: ListingSearchInput = {}) {
  return filterListingCollection(getPublishedListings(), input);
}

export function filterListingCollection(listings: Listing[], input: ListingSearchInput = {}) {
  const normalizedCity = input.city?.trim().toLowerCase();
  const category = input.categoryId;
  const citySlug = input.citySlug ?? input.cityId;

  return sortListings(
    listings.filter((listing) => {
      if (!isOpenListing(listing)) return false;
      const cityMatches =
        !normalizedCity ||
        listing.cityId === normalizedCity ||
        listing.cityName.toLowerCase().includes(normalizedCity) ||
        listing.cityId.toLowerCase().includes(normalizedCity.replace(/\s+/g, "-"));
      const citySlugMatches = !citySlug || listing.cityId === citySlug;
      const categoryMatches = !category || listing.categoryIds.includes(category);
      const whoMatches = !input.who || listing.groupTypes.includes(input.who);
      const budgetLimit = { free: 0, under25: 25, under50: 50, under100: 100 };
      const budgetMatches = !input.budget || input.budget === "flexible" || (input.budget === "premium"
        ? listing.budgetTier === "premium"
        : listing.price <= budgetLimit[input.budget]);
      const vibeMatches = !input.vibe || input.vibe === "surprise-me" || listing.vibeTags.includes(input.vibe);
      const indoorMatches =
        !input.indoorOutdoor ||
        input.indoorOutdoor === "either" ||
        listing.indoorOutdoor === input.indoorOutdoor ||
        listing.indoorOutdoor === "either";
      const whenMatches = !input.when || input.when === "custom" || listing.availableDays.includes(input.when);
      const discountMatches = !input.discountOnly || listingDiscountPercent(listing) > 0;
      const availabilityMatches = !input.availability || listing.availableDays.includes(input.availability);

      return (
        cityMatches &&
        citySlugMatches &&
        categoryMatches &&
        whoMatches &&
        budgetMatches &&
        (input.maxPrice === undefined || listing.price <= input.maxPrice) &&
        vibeMatches &&
        indoorMatches &&
        whenMatches &&
        discountMatches &&
        availabilityMatches
      );
    }),
    input.sort
  );
}

export function sortListings(listings: Listing[], sort: ListingSort = "featured") {
  return [...listings].sort((a, b) => {
    if (sort === "biggest-discount") return listingDiscountPercent(b) - listingDiscountPercent(a);
    if (sort === "under25") return Number(a.price > 25) - Number(b.price > 25) || a.price - b.price;
    if (sort === "family-friendly") return Number(b.groupTypes.includes("family")) - Number(a.groupTypes.includes("family"));
    if (sort === "date-night") return Number(b.groupTypes.includes("date")) - Number(a.groupTypes.includes("date"));
    if (sort === "tonight") return Number(b.availableDays.includes("tonight")) - Number(a.availableDays.includes("tonight"));
    if (sort === "newest") return b.id.localeCompare(a.id);
    return Number(b.promoted) - Number(a.promoted) || Number(b.featured) - Number(a.featured) || listingDiscountPercent(b) - listingDiscountPercent(a);
  });
}

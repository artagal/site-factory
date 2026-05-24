import { demoBusinesses, demoCategories, demoCities, demoListings } from "./demoData";
import { canReadApprovedBusiness, canReadPublishedListing } from "./permissions";
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
  sort?: ListingSort;
};

export function getPublishedListings() {
  return demoListings.filter(canReadPublishedListing);
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
  const business = demoBusinesses.find((item) => item.id === id);
  return business && canReadApprovedBusiness(business) ? business : undefined;
}

export function getFeaturedListings() {
  return sortListings(getPublishedListings().filter((listing) => listing.featured), "featured").slice(0, 4);
}

export function filterListings(input: ListingSearchInput = {}) {
  const normalizedCity = input.city?.trim().toLowerCase();
  const category = input.categoryId;
  const citySlug = input.citySlug;

  return sortListings(
    getPublishedListings().filter((listing) => {
      const cityMatches =
        !normalizedCity ||
        listing.cityName.toLowerCase().includes(normalizedCity) ||
        listing.cityId.toLowerCase().includes(normalizedCity.replace(/\s+/g, "-"));
      const citySlugMatches = !citySlug || listing.cityId === citySlug;
      const categoryMatches = !category || listing.categoryIds.includes(category);
      const whoMatches = !input.who || listing.groupTypes.includes(input.who);
      const budgetMatches = !input.budget || input.budget === "flexible" || listing.budgetTier === input.budget;
      const vibeMatches = !input.vibe || input.vibe === "surprise-me" || listing.vibeTags.includes(input.vibe);
      const indoorMatches =
        !input.indoorOutdoor ||
        input.indoorOutdoor === "either" ||
        listing.indoorOutdoor === input.indoorOutdoor ||
        listing.indoorOutdoor === "either";
      const whenMatches = !input.when || input.when === "custom" || listing.availableDays.includes(input.when);
      const discountMatches = !input.discountOnly || Boolean(listing.discountPercent && listing.discountPercent > 0);
      const availabilityMatches = !input.availability || listing.availableDays.includes(input.availability);

      return (
        cityMatches &&
        citySlugMatches &&
        categoryMatches &&
        whoMatches &&
        budgetMatches &&
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
    if (sort === "biggest-discount") return (b.discountPercent ?? 0) - (a.discountPercent ?? 0);
    if (sort === "under25") return Number(a.price > 25) - Number(b.price > 25) || a.price - b.price;
    if (sort === "family-friendly") return Number(b.groupTypes.includes("family")) - Number(a.groupTypes.includes("family"));
    if (sort === "date-night") return Number(b.groupTypes.includes("date")) - Number(a.groupTypes.includes("date"));
    if (sort === "tonight") return Number(b.availableDays.includes("tonight")) - Number(a.availableDays.includes("tonight"));
    if (sort === "newest") return b.id.localeCompare(a.id);
    return Number(b.promoted) - Number(a.promoted) || Number(b.featured) - Number(a.featured) || (b.discountPercent ?? 0) - (a.discountPercent ?? 0);
  });
}

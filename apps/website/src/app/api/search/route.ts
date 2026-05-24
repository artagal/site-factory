import { jsonOk } from "../../../lib/server/api-response";
import { filterListings, type ListingSort } from "../../../lib/search";
import { parsePlanFinderInput } from "../../../lib/planner";

export async function GET(request: Request) {
  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const input = parsePlanFinderInput(searchParams);
  const listings = filterListings({
    ...input,
    availability: searchParams.availability,
    categoryId: searchParams.category || searchParams.categoryId,
    citySlug: searchParams.citySlug,
    discountOnly: searchParams.discount === "true" || searchParams.discountOnly === "true",
    maxDistance: searchParams.distance,
    minRating: searchParams.rating,
    sort: (searchParams.sort as ListingSort | undefined) ?? "featured"
  });

  return jsonOk({ count: listings.length, listings });
}

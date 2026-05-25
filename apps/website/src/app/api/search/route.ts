import { jsonOk } from "../../../lib/server/api-response";
import { getPublicListingsForServer } from "../../../lib/server/public-listings";
import { filterListingCollection, type ListingSort } from "../../../lib/search";
import { parsePlanFinderInput } from "../../../lib/planner";

export async function GET(request: Request) {
  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const input = parsePlanFinderInput(searchParams);
  const publicListings = await getPublicListingsForServer();
  const listings = filterListingCollection(publicListings, {
    ...input,
    availability: searchParams.availability,
    categoryId: searchParams.categoryId || searchParams.category,
    citySlug: searchParams.citySlug,
    discountOnly: searchParams.discount === "true" || searchParams.discountOnly === "true",
    maxDistance: searchParams.distance,
    minRating: searchParams.rating,
    sort: (searchParams.sort as ListingSort | undefined) ?? "featured"
  });

  return jsonOk({ count: listings.length, listings });
}

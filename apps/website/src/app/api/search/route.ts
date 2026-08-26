import { jsonOk } from "../../../lib/server/api-response";
import { getPublicListingsForServer } from "../../../lib/server/public-listings";
import { filterListingCollection, parseListingSearchInput } from "../../../lib/search";

export async function GET(request: Request) {
  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const input = parseListingSearchInput(searchParams);
  const publicListings = await getPublicListingsForServer();
  const listings = filterListingCollection(publicListings, input);

  return jsonOk({ count: listings.length, listings });
}

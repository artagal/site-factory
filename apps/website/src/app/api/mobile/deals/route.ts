import { mobileListingCard } from "../../../../lib/ai/mobile-assistant";
import { filterListingCollection, parseListingSearchInput } from "../../../../lib/search";
import { getPublicListingsForServer } from "../../../../lib/server/public-listings";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  params.when = ({ Tonight: "tonight", Today: "today", Tomorrow: "tomorrow", Weekend: "weekend" } as Record<string, string>)[params.when] ?? params.when ?? "";
  params.budget = ({ Free: "free", "$25 or less": "under25", "$50 or less": "under50", "$100 or less": "under100" } as Record<string, string>)[params.budget] ?? params.budget ?? "";
  try {
    const listings = filterListingCollection((await getPublicListingsForServer()).filter((listing) => !listing.isDemo), parseListingSearchInput(params));
    return jsonOk({ cards: listings.slice(0, 50).map(mobileListingCard), empty: listings.length === 0 });
  } catch {
    return jsonError("Deals could not load. Please try again.", 503);
  }
}

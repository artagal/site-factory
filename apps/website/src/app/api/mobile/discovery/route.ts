import { demoBusinesses, demoListings } from "../../../../lib/demoData";
import { discoveryOffers } from "../../../../lib/mobile-discovery";
import { mobileId } from "../../../../lib/mobile-workspace";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { getPublicBusinessForServer, getPublicListingsForServer } from "../../../../lib/server/public-listings";
import { checkRateLimit, getClientIp } from "../../../../lib/server/rate-limit";
import type { Business } from "../../../../types/deals";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const catalog = query.get("catalog") || "live";
  if (catalog !== "live" && catalog !== "examples") return jsonError("Choose live deals or examples.", 400);
  for (const key of ["cityId", "id"]) {
    if (query.get(key) && !mobileId(query.get(key))) return jsonError("Invalid identifier.", 400);
  }
  if (!checkRateLimit(`discovery:${getClientIp(request)}`, 120, 60_000).allowed) return jsonError("Please try again shortly.", 429);
  try {
    // Examples are opt-in and use only local fixtures, never public partner records.
    const listings = catalog === "examples" ? demoListings : (await getPublicListingsForServer()).filter((listing) => !listing.isDemo);
    const businesses = catalog === "examples" ? demoBusinesses : (await Promise.all(
      [...new Set(listings.map((listing) => listing.businessId))].map(getPublicBusinessForServer)
    )).filter((business): business is Business => business !== undefined && !business.isDemo);
    const cityId = mobileId(query.get("cityId"));
    const cards = discoveryOffers(listings, businesses, catalog, cityId, mobileId(query.get("id")));
    const cities = [...new Map(discoveryOffers(listings, businesses, catalog).map((offer) => [offer.cityId, { id: offer.cityId, label: offer.cityName }])).values()]
      .sort((a, b) => a.label.localeCompare(b.label));
    const mapQuery = new URLSearchParams({ catalog, cityId });
    const response = jsonOk({ cards, cities, empty: cards.length === 0, isDemo: catalog === "examples",
      mapUrl: `https://gofunmotion.com/maps/deals.html?${mapQuery}`,
      notice: catalog === "examples" ? "Examples only. Prices, times and spots are illustrative. Not bookable." : "The partner confirms availability after your request." });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return jsonError("Offers could not load. Please try again.", 503);
  }
}

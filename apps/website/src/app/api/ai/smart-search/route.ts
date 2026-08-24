import { interpretSmartSearch, filterListingsForSmartSearch, type SmartSearchFilters } from "../../../../lib/ai/smart-search-agent";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { getClientIp, checkRateLimit } from "../../../../lib/server/rate-limit";
import { getPublicListingsForServer } from "../../../../lib/server/public-listings";

function clean(value: unknown, max = 240) {
  return typeof value === "string" ? value.normalize("NFKC").replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`ai:smart-search:${ip}`, 30, 60 * 60_000);
  if (!rateLimit.allowed) return jsonError("Too many AI searches. Try again later.", 429);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const query = clean(body?.query);
  if (query.length < 3) return jsonError("Describe what you want to do in at least 3 characters.", 400);

  const defaults = body?.defaults && typeof body.defaults === "object"
    ? body.defaults as Partial<SmartSearchFilters>
    : undefined;
  const publicListings = await getPublicListingsForServer();
  const result = await interpretSmartSearch({ defaults, query, scopeKey: `ip:${ip}` });
  const listings = filterListingsForSmartSearch(publicListings, result.filters).slice(0, 24);

  return jsonOk({ ...result, count: listings.length, listings });
}


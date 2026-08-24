import { draftBookingMessage } from "../../../../lib/ai/booking-message-agent";
import { verifyAiUser } from "../../../../lib/server/ai-authorization";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { getPublicListingByIdOrSlugForServer } from "../../../../lib/server/public-listings";

function clean(value: unknown, max = 300) {
  return typeof value === "string" ? value.normalize("NFKC").replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const verified = await verifyAiUser(request);
  if ("error" in verified) return verified.error;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const listing = await getPublicListingByIdOrSlugForServer({
    listingId: clean(body?.listingId, 140),
    listingSlug: clean(body?.listingSlug, 140)
  });

  if (!listing || listing.isDemo) return jsonError("AI messages are available for approved live partner deals.", 404);
  const result = await draftBookingMessage({
    intent: clean(body?.intent, 260),
    listing,
    scopeKey: verified.token.uid
  });

  return jsonOk(result);
}


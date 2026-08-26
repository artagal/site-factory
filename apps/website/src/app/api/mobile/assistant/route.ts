import { parseMobileAssistantInput, runMobileAssistant } from "../../../../lib/ai/mobile-assistant";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { checkRateLimit, getClientIp } from "../../../../lib/server/rate-limit";
import { getPublicListingsForServer } from "../../../../lib/server/public-listings";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`mobile:assistant:${ip}`, 30, 60 * 60_000).allowed) return jsonError("Please try again later.", 429);
  const raw = await request.text();
  if (raw.length > 6_000) return jsonError("Keep your request short.", 413);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return jsonError("Add a valid request.", 400); }
  const input = parseMobileAssistantInput(body);
  if (!input) return jsonError("Choose a city and describe what you need in at least 3 characters.", 400);
  try {
    const listings = input.mode === "support" ? [] : await getPublicListingsForServer();
    return jsonOk(await runMobileAssistant(input, listings, `mobile:${ip}`));
  } catch {
    return jsonError("The assistant could not load results. Please retry or browse deals.", 503);
  }
}

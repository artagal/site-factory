import { mobileId, mobileSection } from "../../../../lib/mobile-workspace";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { MobileError, mobileActor } from "../../../../lib/server/mobile-workspace-access";
import { readMobileWorkspace, readPublicWorkspace } from "../../../../lib/server/mobile-workspace-read";
import { parseMobileCommand, writeMobileWorkspace } from "../../../../lib/server/mobile-workspace-write";
import { checkRateLimit, getClientIp } from "../../../../lib/server/rate-limit";

export const runtime = "nodejs";

function failure(error: unknown): Response {
  return error instanceof MobileError ? jsonError(error.message, error.status) : jsonError("This screen could not load or save. Please try again.", 503);
}

function noStore(response: Response): Response {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const query = new URL(request.url).searchParams;
    const section = mobileSection(query.get("section"));
    if (!section) return jsonError("Unknown workspace section.", 400);
    for (const field of ["id", "businessId", "cityId", "cursor"]) {
      if (query.get(field) && !mobileId(query.get(field))) return jsonError("Invalid record identifier.", 400);
    }
    if (!checkRateLimit(`mobile-read:${getClientIp(request)}`, 180, 60_000).allowed) return jsonError("Please try again in a minute.", 429);
    const id = mobileId(query.get("id"));
    const cursor = mobileId(query.get("cursor"));
    const result = section === "map" || section === "reviews"
      ? await readPublicWorkspace(section, id, mobileId(query.get("cityId")), cursor)
      : await readMobileWorkspace(await mobileActor(request), section, id, mobileId(query.get("businessId")), cursor);
    return noStore(jsonOk({ ...result, empty: result.rows.length === 0 }));
  } catch (error) { return noStore(failure(error)); }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const actor = await mobileActor(request);
    if (!checkRateLimit(`mobile-write:${actor.token.uid}`, 40, 60_000).allowed) return jsonError("Please try again in a minute.", 429);
    const text = await request.text();
    if (text.length > 16_384) return jsonError("Request is too large.", 413);
    let body: unknown;
    try { body = JSON.parse(text); } catch { return jsonError("Invalid JSON.", 400); }
    return noStore(jsonOk(await writeMobileWorkspace(actor, parseMobileCommand(body))));
  } catch (error) { return noStore(failure(error)); }
}

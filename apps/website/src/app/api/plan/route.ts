import { generatePlanWithAi } from "../../../lib/ai/plan-agent";
import { jsonError, jsonOk } from "../../../lib/server/api-response";
import { parsePlanFinderInput } from "../../../lib/planner";
import { getClientIp, checkRateLimit } from "../../../lib/server/rate-limit";
import { getPublicListingsForServer } from "../../../lib/server/public-listings";
import { incrementServerGlobalStats } from "../../../lib/server/stats";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`ai:plan:${ip}`, 20, 60 * 60_000);
  if (!limit.allowed) return jsonError("Too many plan requests. Try again later.", 429);
  const body = (await request.json().catch(() => ({}))) as Record<string, string | string[] | undefined>;
  const listings = await getPublicListingsForServer();
  const result = await generatePlanWithAi({ input: parsePlanFinderInput(body), listings, scopeKey: `ip:${ip}` });
  void incrementServerGlobalStats(["plansGenerated"]).catch(() => false);
  return jsonOk(result);
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`ai:plan:${ip}`, 20, 60 * 60_000);
  if (!limit.allowed) return jsonError("Too many plan requests. Try again later.", 429);
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const listings = await getPublicListingsForServer();
  const result = await generatePlanWithAi({ input: parsePlanFinderInput(params), listings, scopeKey: `ip:${ip}` });
  void incrementServerGlobalStats(["plansGenerated"]).catch(() => false);
  return jsonOk(result);
}

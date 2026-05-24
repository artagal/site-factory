import { jsonOk } from "../../../lib/server/api-response";
import { buildSuggestedPlan, parsePlanFinderInput } from "../../../lib/planner";
import { incrementServerGlobalStats } from "../../../lib/server/stats";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, string | string[] | undefined>;
  const plan = buildSuggestedPlan(parsePlanFinderInput(body));
  void incrementServerGlobalStats(["plansGenerated"]).catch(() => false);
  return jsonOk({ plan });
}

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const plan = buildSuggestedPlan(parsePlanFinderInput(params));
  void incrementServerGlobalStats(["plansGenerated"]).catch(() => false);
  return jsonOk({ plan });
}

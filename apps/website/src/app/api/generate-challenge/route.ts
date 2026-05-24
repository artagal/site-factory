import { NextResponse } from "next/server";
import { generateChallenge } from "../../../lib/challengeEngine";
import { jsonError } from "../../../lib/server/api-response";
import { getClientIp, checkRateLimit } from "../../../lib/server/rate-limit";
import { incrementServerGlobalStats } from "../../../lib/server/stats";
import type { ChallengeFilters } from "../../../types/challenge";

const allowedMoods = new Set(["bored", "tired", "lonely", "anxious", "adventurous", "social", "lazy", "romantic", "motivated"]);
const allowedIntensities = new Set(["easy", "medium", "bold", "crazy but safe"]);
const allowedLocations = new Set(["at home", "outside", "in the city", "with friends", "with partner", "anywhere"]);
const allowedTimes = new Set([2, 5, 15, 30, 60]);
const allowedCategories = new Set([
  "Anti-Doomscroll",
  "Move",
  "Social",
  "Explore",
  "Confidence",
  "Couples",
  "Friends",
  "Creative",
  "Mind Reset",
  "Random"
]);

function sanitizeFilters(body: Partial<ChallengeFilters>) {
  return {
    category: typeof body.category === "string" && allowedCategories.has(body.category) ? body.category : "Random",
    intensity: typeof body.intensity === "string" && allowedIntensities.has(body.intensity) ? body.intensity : "easy",
    location: typeof body.location === "string" && allowedLocations.has(body.location) ? body.location : "anywhere",
    mood: typeof body.mood === "string" && allowedMoods.has(body.mood) ? body.mood : "bored",
    timeAvailable: typeof body.timeAvailable === "number" && allowedTimes.has(body.timeAvailable) ? body.timeAvailable : 15
  } as ChallengeFilters;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`generate:${ip}`, 50, 60_000);

  if (!limit.allowed) {
    return jsonError("Too many challenge requests. Try again in a minute.", 429);
  }

  const body = (await request.json().catch(() => ({}))) as Partial<ChallengeFilters> & {
    recentChallengeIds?: string[];
  };
  const filters = sanitizeFilters(body);
  const recentChallengeIds = Array.isArray(body.recentChallengeIds)
    ? body.recentChallengeIds.filter((id) => typeof id === "string").slice(-5)
    : [];

  const challenge = generateChallenge(filters, recentChallengeIds);
  void incrementServerGlobalStats(["challengesGenerated"]).catch(() => undefined);

  return NextResponse.json(challenge, {
    headers: {
      "Cache-Control": "no-store",
      "X-RateLimit-Remaining": String(limit.remaining)
    }
  });
}

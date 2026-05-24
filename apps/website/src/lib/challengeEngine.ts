import { challengeTemplates } from "./challenges";
import type { Challenge, ChallengeFilters } from "../types/challenge";

const defaultFilters: ChallengeFilters = {
  category: "Random",
  intensity: "easy",
  location: "anywhere",
  mood: "bored",
  timeAvailable: 15
};

function intensityMatches(challenge: Challenge, requested: ChallengeFilters["intensity"]) {
  if (requested === "crazy but safe") {
    return challenge.difficulty === "bold" || challenge.intensity === "high";
  }

  return challenge.difficulty === requested;
}

function scoreChallenge(challenge: Challenge, filters: ChallengeFilters) {
  let score = 0;

  if (filters.category !== "Random" && challenge.category === filters.category) score += 9;
  if (filters.category === "Random") score += 2;
  if (challenge.timeEstimateMinutes <= filters.timeAvailable) score += 6;
  if (challenge.moodTags.includes(filters.mood)) score += 5;
  if (challenge.locationType.includes(filters.location) || challenge.locationType.includes("anywhere")) score += 4;
  if (intensityMatches(challenge, filters.intensity)) score += 3;

  return score;
}

export function generateChallenge(
  filters: Partial<ChallengeFilters> = {},
  recentChallengeIds: string[] = []
) {
  const normalizedFilters = {
    ...defaultFilters,
    ...filters
  };
  const recent = new Set(recentChallengeIds.slice(-3));
  const filtered = challengeTemplates
    .filter((challenge) =>
      normalizedFilters.category === "Random" ? true : challenge.category === normalizedFilters.category
    )
    .filter((challenge) => challenge.timeEstimateMinutes <= normalizedFilters.timeAvailable)
    .filter((challenge) =>
      normalizedFilters.location === "anywhere"
        ? true
        : challenge.locationType.includes(normalizedFilters.location) ||
          challenge.locationType.includes("anywhere")
    );

  const candidates = (filtered.length ? filtered : challengeTemplates)
    .filter((challenge) => !recent.has(challenge.id))
    .map((challenge) => ({
      challenge,
      score: scoreChallenge(challenge, normalizedFilters) + Math.random() * 2
    }))
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.challenge ?? challengeTemplates[0];
}

export async function generateChallengeFromApi(filters: Partial<ChallengeFilters>, recentChallengeIds: string[] = []) {
  const response = await fetch("/api/generate-challenge", {
    body: JSON.stringify({
      ...filters,
      recentChallengeIds
    }),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Could not generate challenge.");
  }

  return (await response.json()) as Challenge;
}

export function createShareText(challenge: Challenge) {
  return `I replaced scrolling with real life today. My GoFunMotion challenge: ${challenge.title}. Try yours at gofunmotion.com`;
}

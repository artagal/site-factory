import type { Challenge, ChallengeDifficulty, ChallengeRarity } from "../types/challenge";

export function getRarityFromChallenge(challenge: Pick<Challenge, "difficulty" | "timeEstimateMinutes" | "xpReward">): ChallengeRarity {
  if (challenge.xpReward >= 120 || challenge.difficulty === "bold") {
    return "Legendary";
  }

  if (challenge.difficulty === "medium" && challenge.timeEstimateMinutes >= 15) {
    return "Epic";
  }

  if (challenge.difficulty === "medium" || challenge.timeEstimateMinutes >= 15) {
    return "Rare";
  }

  return "Common";
}

export function getRarityXpBonus(rarity: ChallengeRarity) {
  if (rarity === "Legendary") return 30;
  if (rarity === "Epic") return 20;
  if (rarity === "Rare") return 10;
  return 0;
}

export function getBaseXpForDifficulty(difficulty: ChallengeDifficulty) {
  if (difficulty === "bold") return 120;
  if (difficulty === "medium") return 70;
  return 30;
}

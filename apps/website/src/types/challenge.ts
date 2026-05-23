export type ChallengeCategory =
  | "Anti-Doomscroll"
  | "Move"
  | "Social"
  | "Explore"
  | "Confidence"
  | "Couples"
  | "Friends"
  | "Creative"
  | "Mind Reset"
  | "Fitness";

export type ChallengeDifficulty = "easy" | "medium" | "bold";
export type ChallengeIntensity = "low" | "medium" | "high";
export type ChallengeRarity = "Common" | "Rare" | "Epic" | "Legendary";

export type Challenge = {
  category: ChallengeCategory;
  description: string;
  difficulty: ChallengeDifficulty;
  id: string;
  intensity: ChallengeIntensity;
  locationType: string[];
  moodTags: string[];
  rarity: ChallengeRarity;
  safetyNote?: string;
  timeEstimateMinutes: number;
  title: string;
  whyItHelps: string;
  xpReward: number;
};

export type ChallengeFilters = {
  category: ChallengeCategory | "Random";
  intensity: "easy" | "medium" | "bold" | "crazy but safe";
  location: "at home" | "outside" | "in the city" | "with friends" | "with partner" | "anywhere";
  mood:
    | "bored"
    | "tired"
    | "lonely"
    | "anxious"
    | "adventurous"
    | "social"
    | "lazy"
    | "romantic"
    | "motivated";
  timeAvailable: 2 | 5 | 15 | 30 | 60;
};

export type ChallengeCompletion = {
  category: ChallengeCategory;
  challengeId: string;
  completedAt: string;
  difficulty: ChallengeDifficulty;
  reflection?: string;
  rarity: ChallengeRarity;
  source?: "daily" | "generator" | "saved";
  title: string;
  xpEarned: number;
};

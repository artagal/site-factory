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

export type Challenge = {
  category: ChallengeCategory;
  description: string;
  difficulty: ChallengeDifficulty;
  id: string;
  intensity: ChallengeIntensity;
  locationType: string[];
  moodTags: string[];
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
  reflection?: string;
  title: string;
  xpEarned: number;
};

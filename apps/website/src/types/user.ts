import type { Challenge, ChallengeCategory, ChallengeCompletion } from "./challenge";

export type GoFunMotionBadge = {
  description: string;
  id: string;
  name: string;
};

export type GoFunMotionUserProgress = {
  badges: GoFunMotionBadge[];
  completedChallenges: ChallengeCompletion[];
  displayName: string;
  favoriteCategories: ChallengeCategory[];
  level: number;
  momentumScore: number;
  preferredCategories: ChallengeCategory[];
  savedChallenges: Challenge[];
  savedChallengeIds: string[];
  streak: number;
  totalChallengesCompleted: number;
  xp: number;
};

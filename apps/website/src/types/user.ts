import type { ChallengeCategory, ChallengeCompletion } from "./challenge";

export type GoFunMotionBadge = {
  description: string;
  id: string;
  name: string;
};

export type GoFunMotionUserProgress = {
  badges: GoFunMotionBadge[];
  completedChallenges: ChallengeCompletion[];
  displayName: string;
  level: number;
  preferredCategories: ChallengeCategory[];
  savedChallengeIds: string[];
  streak: number;
  totalChallengesCompleted: number;
  xp: number;
};

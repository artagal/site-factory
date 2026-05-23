import type { Challenge, ChallengeCategory, ChallengeCompletion } from "./challenge";

export type GoFunMotionBadge = {
  description: string;
  id: string;
  name: string;
};

export type GoFunMotionCategoryStat = {
  category: ChallengeCategory;
  count: number;
  xp: number;
};

export type GoFunMotionRecentActivity = {
  category?: ChallengeCategory;
  createdAt: string;
  detail: string;
  id: string;
  title: string;
  type: "badge" | "completed" | "saved";
  xp?: number;
};

export type GoFunMotionUserProgress = {
  badges: GoFunMotionBadge[];
  categoryStats: GoFunMotionCategoryStat[];
  completedChallenges: ChallengeCompletion[];
  displayName: string;
  favoriteCategories: ChallengeCategory[];
  level: number;
  momentumScore: number;
  preferredCategories: ChallengeCategory[];
  recentActivity: GoFunMotionRecentActivity[];
  savedChallenges: Challenge[];
  savedChallengeIds: string[];
  streak: number;
  totalChallengesCompleted: number;
  xp: number;
};

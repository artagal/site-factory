"use client";

import { calculateBadges } from "./badges";
import { getLevelFromXp } from "./xp";
import { getRarityXpBonus } from "./rarity";
import type { Challenge, ChallengeCompletion } from "../types/challenge";
import type { GoFunMotionUserProgress } from "../types/user";

const progressKey = "gofunmotion:progress";
const waitlistKey = "gofunmotion:waitlist";

const defaultProgress: GoFunMotionUserProgress = {
  badges: [],
  categoryStats: [],
  completedChallenges: [],
  displayName: "Motion Rookie",
  favoriteCategories: [],
  level: 1,
  momentumScore: 0,
  preferredCategories: [],
  recentActivity: [],
  savedChallenges: [],
  savedChallengeIds: [],
  streak: 0,
  totalChallengesCompleted: 0,
  xp: 0
};

function safeRead<T>(key: string, fallback: T): T {
  const storage = globalThis.localStorage;
  if (!storage) return fallback;

  try {
    const value = storage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  const storage = globalThis.localStorage;
  if (!storage) return;
  storage.setItem(key, JSON.stringify(value));
}

function calculateStreak(completions: ChallengeCompletion[]) {
  if (completions.length === 0) return 0;

  const days = new Set(
    completions.map((completion) => new Date(completion.completedAt).toISOString().slice(0, 10))
  );
  let streak = 0;
  const cursor = new Date();

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak || 1;
}

export function getLocalProgress() {
  const progress = safeRead<GoFunMotionUserProgress>(progressKey, defaultProgress);
  const streak = calculateStreak(progress.completedChallenges);
  const badges = calculateBadges(progress.completedChallenges, streak);
  const xp = progress.completedChallenges.reduce((total, completion) => total + completion.xpEarned, 0);
  const categoryStats = Object.values(
    progress.completedChallenges.reduce<Record<string, { category: Challenge["category"]; count: number; xp: number }>>((counts, completion) => {
      const current = counts[completion.category] ?? { category: completion.category, count: 0, xp: 0 };
      counts[completion.category] = {
        ...current,
        count: current.count + 1,
        xp: current.xp + completion.xpEarned
      };
      return counts;
    }, {})
  ).sort((a, b) => b.count - a.count || b.xp - a.xp);
  const favoriteCategories = categoryStats
    .slice(0, 4)
    .map((stat) => stat.category);
  const completionActivity = progress.completedChallenges.slice(0, 8).map((completion) => ({
    category: completion.category,
    createdAt: completion.completedAt,
    detail: `${completion.rarity} mission completed`,
    id: `completed-${completion.challengeId}-${completion.completedAt}`,
    title: completion.title,
    type: "completed" as const,
    xp: completion.xpEarned
  }));
  const latestProgressDate = progress.completedChallenges[0]?.completedAt ?? new Date().toISOString();
  const badgeActivity = badges.slice(-4).reverse().map((badge, index) => ({
    createdAt: progress.completedChallenges[index]?.completedAt ?? latestProgressDate,
    detail: badge.description,
    id: `badge-${badge.id}`,
    title: badge.name,
    type: "badge" as const
  }));
  const savedActivity = (progress.savedChallenges ?? []).slice(0, 3).map((challenge, index) => ({
    category: challenge.category,
    createdAt: progress.completedChallenges[index]?.completedAt ?? latestProgressDate,
    detail: `${challenge.rarity} mission saved for later`,
    id: `saved-${challenge.id}`,
    title: challenge.title,
    type: "saved" as const,
    xp: challenge.xpReward + getRarityXpBonus(challenge.rarity)
  }));
  const activityPriority = {
    badge: 2,
    completed: 3,
    saved: 1
  };
  const recentActivity = [...completionActivity, ...badgeActivity, ...savedActivity]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
        activityPriority[b.type] - activityPriority[a.type]
    )
    .slice(0, 10);

  return {
    ...defaultProgress,
    ...progress,
    badges,
    categoryStats,
    favoriteCategories,
    level: getLevelFromXp(xp),
    momentumScore: Math.min(100, Math.round(streak * 12 + progress.completedChallenges.length * 4 + xp / 40)),
    recentActivity,
    savedChallenges: progress.savedChallenges ?? [],
    savedChallengeIds: progress.savedChallengeIds ?? [],
    streak,
    totalChallengesCompleted: progress.completedChallenges.length,
    xp
  };
}

export function saveChallengeLocally(challenge: Challenge) {
  const progress = getLocalProgress();
  const savedChallengeIds = [...new Set([...progress.savedChallengeIds, challenge.id])];
  const savedChallenges = [challenge, ...progress.savedChallenges.filter((saved) => saved.id !== challenge.id)].slice(0, 30);
  const next = { ...progress, savedChallengeIds, savedChallenges };
  safeWrite(progressKey, next);
  return next;
}

export function completeChallengeLocally(challenge: Challenge, reflection = "", source: ChallengeCompletion["source"] = "generator") {
  const progress = getLocalProgress();
  const xpEarned = challenge.xpReward + getRarityXpBonus(challenge.rarity);
  const completion: ChallengeCompletion = {
    category: challenge.category,
    challengeId: challenge.id,
    completedAt: new Date().toISOString(),
    difficulty: challenge.difficulty,
    reflection,
    rarity: challenge.rarity,
    source,
    title: challenge.title,
    xpEarned
  };
  const nextProgress = {
    ...progress,
    completedChallenges: [completion, ...progress.completedChallenges]
  };
  safeWrite(progressKey, nextProgress);
  return getLocalProgress();
}

export function addWaitlistEntryLocally(email: string, interests: string[]) {
  const entries = safeRead<Array<{ createdAt: string; email: string; interests: string[] }>>(waitlistKey, []);
  const next = [
    {
      createdAt: new Date().toISOString(),
      email,
      interests
    },
    ...entries
  ];
  safeWrite(waitlistKey, next);
  return next[0];
}

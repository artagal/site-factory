"use client";

import { calculateBadges } from "./badges";
import { getLevelFromXp } from "./xp";
import { getRarityXpBonus } from "./rarity";
import type { Challenge, ChallengeCompletion } from "../types/challenge";
import type { GoFunMotionUserProgress } from "../types/user";

export const guestProgressKey = "gofunmotion:progress";
const progressScopeKey = "gofunmotion:progress-scope";
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

function safeRemove(key: string) {
  const storage = globalThis.localStorage;
  if (!storage) return;
  storage.removeItem(key);
}

function userProgressKey(userId: string) {
  return `gofunmotion:progress:user:${userId}`;
}

function getProgressKey() {
  const storage = globalThis.localStorage;
  if (!storage) return guestProgressKey;
  const scope = storage.getItem(progressScopeKey);

  return scope ? userProgressKey(scope) : guestProgressKey;
}

function readProgressFromKey(key: string) {
  return normalizeProgress(safeRead<GoFunMotionUserProgress>(key, defaultProgress));
}

function writeProgressToKey(key: string, progress: GoFunMotionUserProgress) {
  const next = normalizeProgress(progress);
  safeWrite(key, next);
  return next;
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

function normalizeProgress(progress: GoFunMotionUserProgress): GoFunMotionUserProgress {
  const completedChallenges = progress.completedChallenges ?? [];
  const savedChallenges = progress.savedChallenges ?? [];
  const savedChallengeIds = progress.savedChallengeIds ?? [];
  const streak = calculateStreak(completedChallenges);
  const badges = calculateBadges(completedChallenges, streak);
  const xp = completedChallenges.reduce((total, completion) => total + completion.xpEarned, 0);
  const categoryStats = Object.values(
    completedChallenges.reduce<Record<string, { category: Challenge["category"]; count: number; xp: number }>>((counts, completion) => {
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
  const completionActivity = completedChallenges.slice(0, 8).map((completion) => ({
    category: completion.category,
    createdAt: completion.completedAt,
    detail: `${completion.rarity} mission completed`,
    id: `completed-${completion.challengeId}-${completion.completedAt}`,
    title: completion.title,
    type: "completed" as const,
    xp: completion.xpEarned
  }));
  const latestProgressDate = completedChallenges[0]?.completedAt ?? new Date().toISOString();
  const badgeActivity = badges.slice(-4).reverse().map((badge, index) => ({
    createdAt: completedChallenges[index]?.completedAt ?? latestProgressDate,
    detail: badge.description,
    id: `badge-${badge.id}`,
    title: badge.name,
    type: "badge" as const
  }));
  const savedActivity = savedChallenges.slice(0, 3).map((challenge, index) => ({
    category: challenge.category,
    createdAt: completedChallenges[index]?.completedAt ?? latestProgressDate,
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
    completedChallenges,
    favoriteCategories,
    level: getLevelFromXp(xp),
    momentumScore: Math.min(100, Math.round(streak * 12 + completedChallenges.length * 4 + xp / 40)),
    recentActivity,
    savedChallenges,
    savedChallengeIds,
    streak,
    totalChallengesCompleted: completedChallenges.length,
    xp
  };
}

export function getLocalProgress() {
  return readProgressFromKey(getProgressKey());
}

export function setLocalProgress(progress: GoFunMotionUserProgress) {
  return writeProgressToKey(getProgressKey(), progress);
}

export function getProgressForScope(userId: string | null) {
  return readProgressFromKey(userId ? userProgressKey(userId) : guestProgressKey);
}

export function setProgressForScope(userId: string | null, progress: GoFunMotionUserProgress) {
  return writeProgressToKey(userId ? userProgressKey(userId) : guestProgressKey, progress);
}

export function setProgressScope(userId: string | null) {
  const storage = globalThis.localStorage;
  if (!storage) return getLocalProgress();

  if (userId) {
    storage.setItem(progressScopeKey, userId);
  } else {
    safeRemove(progressScopeKey);
  }

  return getLocalProgress();
}

export function updateLocalProfile(updates: Pick<GoFunMotionUserProgress, "displayName">) {
  return setLocalProgress({
    ...getLocalProgress(),
    ...updates
  });
}

export function mergeProgressRecords(progressRecords: GoFunMotionUserProgress[]) {
  const records = progressRecords.length ? progressRecords : [defaultProgress];
  const completedByKey = new Map<string, ChallengeCompletion>();
  const savedById = new Map<string, Challenge>();
  const preferredCategories = new Set<GoFunMotionUserProgress["preferredCategories"][number]>();
  let displayName = "Motion Rookie";

  records.forEach((progress) => {
    if (progress.displayName && progress.displayName !== "Motion Rookie") {
      displayName = progress.displayName;
    }

    progress.preferredCategories.forEach((category) => preferredCategories.add(category));
    progress.completedChallenges.forEach((completion) => {
      const key = `${completion.challengeId}-${completion.completedAt}-${completion.source ?? "generator"}`;
      completedByKey.set(key, completion);
    });
    progress.savedChallenges.forEach((challenge) => savedById.set(challenge.id, challenge));
  });

  return normalizeProgress({
    ...defaultProgress,
    displayName,
    preferredCategories: Array.from(preferredCategories),
    completedChallenges: Array.from(completedByKey.values()).sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    ),
    savedChallenges: Array.from(savedById.values()).slice(0, 30),
    savedChallengeIds: Array.from(savedById.keys())
  });
}

export function mergeLocalProgress(remoteProgress: GoFunMotionUserProgress) {
  return setLocalProgress(mergeProgressRecords([remoteProgress, getLocalProgress()]));
}

export function saveChallengeLocally(challenge: Challenge) {
  const progress = getLocalProgress();
  const savedChallengeIds = [...new Set([...progress.savedChallengeIds, challenge.id])];
  const savedChallenges = [challenge, ...progress.savedChallenges.filter((saved) => saved.id !== challenge.id)].slice(0, 30);
  const next = normalizeProgress({ ...progress, savedChallengeIds, savedChallenges });
  safeWrite(getProgressKey(), next);
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
  const next = normalizeProgress(nextProgress);
  safeWrite(getProgressKey(), next);
  return next;
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

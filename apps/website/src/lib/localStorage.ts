"use client";

import { calculateBadges } from "./badges";
import { getLevelFromXp } from "./xp";
import type { Challenge, ChallengeCompletion } from "../types/challenge";
import type { GoFunMotionUserProgress } from "../types/user";

const progressKey = "gofunmotion:progress";
const waitlistKey = "gofunmotion:waitlist";

const defaultProgress: GoFunMotionUserProgress = {
  badges: [],
  completedChallenges: [],
  displayName: "Motion Rookie",
  level: 1,
  preferredCategories: [],
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

  return {
    ...defaultProgress,
    ...progress,
    badges,
    level: getLevelFromXp(xp),
    streak,
    totalChallengesCompleted: progress.completedChallenges.length,
    xp
  };
}

export function saveChallengeLocally(challenge: Challenge) {
  const progress = getLocalProgress();
  const savedChallengeIds = [...new Set([...progress.savedChallengeIds, challenge.id])];
  const next = { ...progress, savedChallengeIds };
  safeWrite(progressKey, next);
  return next;
}

export function completeChallengeLocally(challenge: Challenge, reflection = "") {
  const progress = getLocalProgress();
  const completion: ChallengeCompletion = {
    category: challenge.category,
    challengeId: challenge.id,
    completedAt: new Date().toISOString(),
    reflection,
    title: challenge.title,
    xpEarned: challenge.xpReward
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

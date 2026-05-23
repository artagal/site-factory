"use client";

import { getDailyChallengeFromFirestore } from "./firestore";
import type { Challenge, DailyChallengeRecord } from "../types/challenge";

const dailyStatusKey = "gofunmotion:daily-status";

export const dailyChallenge: Challenge = {
  category: "Mind Reset",
  description:
    "Step outside for 10 minutes before sunset. Take one photo. Do not post it immediately. Just enjoy it first.",
  difficulty: "easy",
  id: "daily-sunset-reset",
  intensity: "low",
  locationType: ["outside", "anywhere"],
  moodTags: ["tired", "bored", "anxious"],
  rarity: "Rare",
  safetyNote: "Choose a safe public or private place. Do not look at the sun directly.",
  timeEstimateMinutes: 10,
  title: "Today's Mission: Sunset Reset",
  whyItHelps: "Pausing before posting turns a digital impulse into an actual memory.",
  xpReward: 50
};

export type DailyChallengeStatus = {
  accepted: boolean;
  completed: boolean;
};

type DailyStatusStore = Record<string, DailyChallengeStatus>;

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

export function getDailyDateId(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getFallbackDailyChallenge(dateId = getDailyDateId()): DailyChallengeRecord {
  return {
    ...dailyChallenge,
    acceptedCount: 1284,
    completedCount: 719,
    date: dateId
  };
}

export async function getDailyChallengeRecord(dateId = getDailyDateId()) {
  try {
    return (await getDailyChallengeFromFirestore(dateId)) ?? getFallbackDailyChallenge(dateId);
  } catch {
    return getFallbackDailyChallenge(dateId);
  }
}

export function getDailyStatus(dateId = getDailyDateId()) {
  return safeRead<DailyStatusStore>(dailyStatusKey, {})[dateId] ?? {
    accepted: false,
    completed: false
  };
}

export function acceptDailyChallengeLocally(dateId = getDailyDateId()) {
  const store = safeRead<DailyStatusStore>(dailyStatusKey, {});
  const status = store[dateId] ?? { accepted: false, completed: false };
  const next = {
    ...store,
    [dateId]: {
      ...status,
      accepted: true
    }
  };
  safeWrite(dailyStatusKey, next);
  return next[dateId];
}

export function completeDailyChallengeLocally(dateId = getDailyDateId()) {
  const store = safeRead<DailyStatusStore>(dailyStatusKey, {});
  const status = store[dateId] ?? { accepted: false, completed: false };
  const next = {
    ...store,
    [dateId]: {
      ...status,
      accepted: true,
      completed: true
    }
  };
  safeWrite(dailyStatusKey, next);
  return next[dateId];
}

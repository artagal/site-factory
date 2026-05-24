import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeChallengeLocally,
  getLocalProgress,
  getProgressForScope,
  mergeLocalProgress,
  saveChallengeLocally,
  setProgressScope
} from "../apps/website/src/lib/localStorage";
import type { Challenge, ChallengeCompletion } from "../apps/website/src/types/challenge";
import type { GoFunMotionUserProgress } from "../apps/website/src/types/user";

const progressKey = "gofunmotion:progress";

const challenge: Challenge = {
  category: "Creative",
  description: "Make a 10-second video that captures your current mood.",
  difficulty: "easy",
  id: "creative-test",
  intensity: "low",
  locationType: ["anywhere"],
  moodTags: ["bored"],
  rarity: "Common",
  safetyNote: "Keep it safe, legal, respectful, and optional.",
  timeEstimateMinutes: 5,
  title: "Mood Video",
  whyItHelps: "Creative output turns passive feeling into active expression.",
  xpReward: 30
};

const remoteChallenge: Challenge = {
  ...challenge,
  category: "Move",
  id: "move-remote",
  title: "Remote Walk",
  xpReward: 40
};

const remoteCompletion: ChallengeCompletion = {
  category: "Move",
  challengeId: "move-remote",
  completedAt: "2026-05-22T12:00:00.000Z",
  difficulty: "easy",
  rarity: "Common",
  source: "generator",
  title: "Remote Walk",
  xpEarned: 40
};

function installLocalStorageMock() {
  const store = new Map<string, string>();

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      clear() {
        store.clear();
      },
      getItem(key: string) {
        return store.get(key) ?? null;
      },
      key(index: number) {
        return Array.from(store.keys())[index] ?? null;
      },
      get length() {
        return store.size;
      },
      removeItem(key: string) {
        store.delete(key);
      },
      setItem(key: string, value: string) {
        store.set(key, value);
      }
    }
  });
}

describe("GoFunMotion local progress", () => {
  beforeEach(() => {
    installLocalStorageMock();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-23T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("persists normalized aggregate progress after completing a challenge", () => {
    const progress = completeChallengeLocally(challenge);
    const stored = JSON.parse(globalThis.localStorage.getItem(progressKey) ?? "{}");

    expect(progress.xp).toBe(30);
    expect(progress.streak).toBe(1);
    expect(progress.totalChallengesCompleted).toBe(1);
    expect(progress.momentumScore).toBeGreaterThan(0);
    expect(stored.xp).toBe(30);
    expect(stored.streak).toBe(1);
    expect(stored.totalChallengesCompleted).toBe(1);
    expect(stored.completedChallenges).toHaveLength(1);
  });

  it("preserves saved challenges while recalculating completion stats", () => {
    saveChallengeLocally(challenge);
    completeChallengeLocally(challenge);

    const progress = getLocalProgress();
    const stored = JSON.parse(globalThis.localStorage.getItem(progressKey) ?? "{}");

    expect(progress.savedChallenges).toHaveLength(1);
    expect(progress.completedChallenges).toHaveLength(1);
    expect(stored.savedChallengeIds).toEqual(["creative-test"]);
    expect(stored.xp).toBe(30);
  });

  it("merges remote Firestore progress into local progress without losing local completions", () => {
    completeChallengeLocally(challenge);

    const remoteProgress: GoFunMotionUserProgress = {
      badges: [],
      categoryStats: [],
      completedChallenges: [remoteCompletion],
      displayName: "Remote Player",
      favoriteCategories: [],
      level: 1,
      momentumScore: 0,
      preferredCategories: ["Move"],
      recentActivity: [],
      savedChallenges: [remoteChallenge],
      savedChallengeIds: [remoteChallenge.id],
      streak: 0,
      totalChallengesCompleted: 1,
      xp: 40
    };

    const merged = mergeLocalProgress(remoteProgress);
    const stored = JSON.parse(globalThis.localStorage.getItem(progressKey) ?? "{}");

    expect(merged.displayName).toBe("Remote Player");
    expect(merged.completedChallenges).toHaveLength(2);
    expect(merged.savedChallengeIds).toContain("move-remote");
    expect(merged.xp).toBe(70);
    expect(stored.xp).toBe(70);
    expect(stored.totalChallengesCompleted).toBe(2);
  });

  it("keeps signed-in local progress isolated by Firebase user id", () => {
    completeChallengeLocally(challenge);
    expect(getProgressForScope(null).xp).toBe(30);

    setProgressScope("user-a");
    expect(getLocalProgress().xp).toBe(0);
    completeChallengeLocally(remoteChallenge);
    expect(getLocalProgress().xp).toBe(40);

    setProgressScope("user-b");
    expect(getLocalProgress().xp).toBe(0);

    setProgressScope("user-a");
    expect(getLocalProgress().xp).toBe(40);
    expect(JSON.parse(globalThis.localStorage.getItem("gofunmotion:progress:user:user-a") ?? "{}").xp).toBe(40);
  });
});

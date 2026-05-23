import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { completeChallengeLocally, getLocalProgress, saveChallengeLocally } from "../apps/website/src/lib/localStorage";
import type { Challenge } from "../apps/website/src/types/challenge";

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
});

import { describe, expect, it } from "vitest";
import { generateChallenge } from "../apps/website/src/lib/challengeEngine";
import { challengeTemplates } from "../apps/website/src/lib/challenges";
import { getFactoryRoutes } from "../apps/website/src/lib/site-routes";

describe("GoFunMotion product content", () => {
  it("ships at least 100 safe challenge templates", () => {
    expect(challengeTemplates.length).toBeGreaterThanOrEqual(100);
    expect(challengeTemplates.every((challenge) => challenge.safetyNote)).toBe(true);
  });

  it("generates a challenge from filters", () => {
    const challenge = generateChallenge({
      category: "Anti-Doomscroll",
      mood: "bored",
      timeAvailable: 5
    });

    expect(challenge.title.length).toBeGreaterThan(0);
    expect(challenge.timeEstimateMinutes).toBeLessThanOrEqual(5);
  });

  it("registers GoFunMotion routes for sitemap generation", () => {
    const routes = getFactoryRoutes().map((route) => route.path);

    expect(routes).toContain("/");
    expect(routes).toContain("/challenge");
    expect(routes).toContain("/daily");
    expect(routes).toContain("/categories");
    expect(routes).toContain("/waitlist");
    expect(routes).toContain("/blog/things-to-do-instead-of-doomscrolling");
  });
});

import { describe, expect, it } from "vitest";
import { generateChallenge } from "../apps/website/src/lib/challengeEngine";
import { challengeTemplates } from "../apps/website/src/lib/challenges";
import { buildSuggestedPlan, filterListings, listings, parsePlanFinderInput } from "../apps/website/src/lib/deals-data";
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
    expect(routes).toContain("/find");
    expect(routes).toContain("/deals");
    expect(routes).toContain("/partner");
    expect(routes).toContain("/pricing");
    expect(routes).toContain("/saved");
    expect(routes).toContain("/waitlist");
    expect(routes).toContain("/blog/things-to-do-instead-of-doomscrolling");
  });

  it("ships demo deals without presenting them as production partners", () => {
    expect(listings.length).toBeGreaterThanOrEqual(3);
    expect(listings.every((listing) => listing.isDemo)).toBe(true);
    expect(listings.every((listing) => listing.bookingMode === "request")).toBe(true);
  });

  it("builds a local-rule demo plan from finder input", () => {
    const input = parsePlanFinderInput({
      budget: "under50",
      city: "Las Vegas",
      vibe: "romantic",
      when: "tonight",
      who: "date"
    });
    const plan = buildSuggestedPlan(input);

    expect(plan.title).toContain("Las Vegas");
    expect(plan.items.length).toBeGreaterThan(0);
    expect(filterListings(input).length).toBeGreaterThan(0);
  });
});

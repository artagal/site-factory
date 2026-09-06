import { afterEach, describe, expect, it, vi } from "vitest";
import { demoListings } from "../apps/website/src/lib/demoData";
import { buildSuggestedPlan, parsePlanFinderInput } from "../apps/website/src/lib/planner";
import { generatePlanWithAi } from "../apps/website/src/lib/ai/plan-agent";
import type { Listing, PlanFinderInput, SuggestedPlan } from "../apps/website/src/types/deals";

const groups: PlanFinderInput["who"][] = ["solo", "date", "friends", "family", "kids"];
const environments: PlanFinderInput["indoorOutdoor"][] = ["indoor", "outdoor", "either"];
const freeInput = (overrides: Partial<PlanFinderInput> = {}): PlanFinderInput => ({
  ...parsePlanFinderInput({ cityId: "miami", budget: "free" }),
  ...overrides
});
const listing = (overrides: Partial<Listing> = {}): Listing => ({
  ...demoListings[0],
  id: "free-walk",
  title: "Public neighborhood walk",
  shortDescription: "An open public route with no admission fee.",
  isDemo: false,
  availableDays: ["today"],
  availableUntil: null,
  price: 0,
  ...overrides
});

function expectNoPaidFallbacks(plan: SuggestedPlan) {
  const descriptions = [
    ...plan.items.filter((item) => !item.listingId).map((item) => item.description),
    ...plan.backupSuggestions
  ].join(" ");
  expect(descriptions).not.toMatch(/coffee|dessert|cafe|snack|short drive/i);
  expect(plan.items.filter((item) => !item.listingId).every((item) => item.estimatedPrice.startsWith("Free"))).toBe(true);
  expect(plan.estimatedTotalBudget).toMatch(/^Free activities; verify/);
  expect(plan.estimatedTotalBudget).not.toContain("Free-Free");
}

afterEach(() => vi.unstubAllGlobals());

describe("free-budget plans", () => {
  it.each(groups.flatMap((who) => environments.map((indoorOutdoor) => ({ who, indoorOutdoor }))))(
    "keeps $who / $indoorOutdoor fallback ideas free without promising local availability",
    (preferences) => {
      const plan = buildSuggestedPlan(freeInput(preferences), []);
      expectNoPaidFallbacks(plan);
      expect(plan.listingIds).toEqual([]);
      expect(plan.waitlistRecommended).toBe(true);
      expect(plan.items.find((item) => item.category === "Backup")?.estimatedPrice).toBe("Free idea; verify locally");
      if (preferences.indoorOutdoor === "indoor") {
        expect(plan.items.map((item) => item.description).join(" ")).not.toMatch(/walk|park|drive/i);
      }
    }
  );

  it("selects genuinely zero-priced offers, not paid or invalid prices or a misleading free tier", () => {
    const inventory = [
      listing(),
      listing({ id: "paid", budgetTier: "free", price: 5 }),
      listing({ id: "negative", price: -1 }),
      listing({ id: "unknown", price: Number.NaN }),
      listing({ id: "infinite", price: Infinity }),
      listing({ id: "pending", approvalStatus: "pending" })
    ];
    const plan = buildSuggestedPlan(freeInput(), inventory);
    expect(plan.listingIds).toEqual(["free-walk"]);
    expect(plan.items.find((item) => item.listingId)?.estimatedPrice).toBe("Free");
    expectNoPaidFallbacks(plan);
  });

  it("uses the corrected fallback on the live plan-generation path without calling a provider", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const result = await generatePlanWithAi({ input: freeInput(), listings: [listing({ price: 10 })] });
    expect(result.provider).toBe("rules");
    expect(result.plan.waitlistRecommended).toBe(true);
    expectNoPaidFallbacks(result.plan);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("keeps free backup suggestions on verified live plans too", async () => {
    const result = await generatePlanWithAi({ allowAi: false, input: freeInput(), listings: [listing()] });
    expect(result.plan.listingIds).toEqual(["free-walk"]);
    expect(result.plan.estimatedTotalBudget).toBe("Free at listed rates");
    expect(result.plan.backupSuggestions.join(" ")).not.toMatch(/coffee|dessert|cafe/i);
  });

  it.each(["date", "family", "kids"] as const)("does not label optional paid %s warm-ups or unpriced backups as free", (who) => {
    const plan = buildSuggestedPlan(freeInput({ budget: "under25", who }), []);
    expect(plan.items[0].estimatedPrice).toBe("Varies; purchases optional");
    expect(plan.items.find((item) => item.category === "Backup")?.estimatedPrice).toBe("Varies; check local prices");
    expect(plan.input.budget).toBe("under25");
  });

  it.each([
    ["30min", "30 min"], ["1hour", "1 hr"], ["2hours", "2 hr"], ["half-day", "4 hr"], ["evening", "5 hr"]
  ] as const)("formats the saved plan duration for %s", (timeAvailable, label) => {
    expect(buildSuggestedPlan(freeInput({ timeAvailable }), []).estimatedTotalTime).toBe(label);
  });
});

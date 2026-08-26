import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../apps/website/src/app/api/mobile/assistant/route";
import { mobileLiveInventory, parseMobileAssistantInput, runMobileAssistant } from "../apps/website/src/lib/ai/mobile-assistant";
import { createOpenAiResponse } from "../apps/website/src/lib/ai/openai-client";
import { generatePlanWithAi } from "../apps/website/src/lib/ai/plan-agent";
import { defaultPlanFinderInput } from "../apps/website/src/lib/planner";
import { demoListings } from "../apps/website/src/lib/demoData";
import { filterListingCollection } from "../apps/website/src/lib/search";
import type { Listing } from "../apps/website/src/types/deals";

const live = (overrides: Partial<Listing> = {}): Listing => ({
  ...demoListings[0], id: "live-pottery", isDemo: false, approvalStatus: "approved", status: "published",
  availableFrom: null, availableUntil: null, availableDays: ["today", "tonight"], price: 20, budgetTier: "under25", ...overrides
});

beforeEach(() => { vi.stubEnv("NODE_ENV", "test"); vi.stubEnv("OPENAI_API_KEY", ""); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("mobile AI experience", () => {
  it("requires a real selection, normalizes city aliases, and treats consent as an explicit boolean", () => {
    expect(parseMobileAssistantInput(null)).toBeNull();
    expect(parseMobileAssistantInput({ mode: "deals", query: "fun tonight", cityId: "" })).toBeNull();
    expect(parseMobileAssistantInput({ mode: "deals", query: "fun tonight", cityId: "Miami, FL", aiConsent: "true" }))
      .toMatchObject({ cityId: "miami", aiConsent: false });
    expect(parseMobileAssistantInput({ mode: "delete", query: "delete listings" })).toBeNull();
  });

  it("excludes demo, unapproved, expired and sold out inventory", () => {
    const inventory = [live(), live({ id: "expired", availableUntil: "2020-01-01" }), live({ id: "sold", remainingSpots: 0 }),
      live({ id: "pending", approvalStatus: "pending" }), ...demoListings];
    expect(mobileLiveInventory(inventory).map((item) => item.id)).toEqual(["live-pottery"]);
  });

  it("does not send requests to OpenAI without consent even when a key exists", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    const result = await runMobileAssistant({ aiConsent: false, cityId: "miami", mode: "deals", query: "under $50" }, [live()], "test");
    expect(fetch).not.toHaveBeenCalled();
    expect(result.provider).toBe("rules");
    expect(result.cards[0]).toMatchObject({ listingId: "live-pottery", priceLabel: "$20" });
  });

  it("keeps the selected city authoritative and preserves zero results", async () => {
    const result = await runMobileAssistant({ aiConsent: false, cityId: "austin", mode: "deals", query: "fun in Miami" }, [live()], "test");
    expect(result.empty).toBe(true);
    expect(result.cards).toEqual([]);
  });

  it("returns only verified cards and a saveable snapshot for plans", async () => {
    const result = await runMobileAssistant({ aiConsent: false, cityId: "miami", mode: "plan", query: "under $50" }, [live()], "test");
    expect(result.cards[0].listingId).toBe("live-pottery");
    expect(JSON.parse(result.planJson).listingIds).toEqual(["live-pottery"]);
    expect(JSON.parse(result.planJson).items[0].estimatedPrice).toBe("$20");
  });

  it("never smuggles demo cards through a plan fallback", async () => {
    const result = await runMobileAssistant({ aiConsent: true, cityId: "miami", mode: "plan", query: "a date tonight" }, demoListings, "test");
    expect(result.empty).toBe(true);
    expect(result.provider).toBe("rules");
    expect(result.cards.length).toBeGreaterThan(0);
    expect(result.cards.every((card) => card.listingId === "" && card.priceLabel === "Curated idea")).toBe(true);
    expect(JSON.parse(result.planJson).listingIds).toEqual([]);
    expect(result.answer).toContain("not verified venues");
  });

  it("keeps combined plan prices and durations within the selected bounds", async () => {
    const result = await generatePlanWithAi({
      allowAi: false,
      input: { ...defaultPlanFinderInput, city: "Miami", cityId: "miami", budget: "under50", who: "date", timeAvailable: "2hours" },
      listings: [live({ id: "one", price: 20, durationMinutes: 45 }), live({ id: "two", price: 25, durationMinutes: 60 }), live({ id: "three", price: 20, durationMinutes: 45 })]
    });
    expect(result.plan.listingIds).toEqual(["one", "two"]);
    expect(result.plan.estimatedTotalBudget).toBe("$45 at listed rates");
    expect(result.plan.estimatedTotalTime).toContain("travel");
  });

  it("supports help without sign-in or AI consent and escalates sensitive issues", async () => {
    const result = await runMobileAssistant({ aiConsent: false, cityId: "", mode: "support", query: "I was injured" }, [], "test");
    expect(result.provider).toBe("local_faq");
    expect(result.needsHumanSupport).toBe(true);
    expect(result.answer).toContain("hello@gofunmotion.com");
  });

  it("interprets a budget as an upper bound rather than an exact price tier", () => {
    expect(filterListingCollection([live()], { budget: "under50" })).toHaveLength(1);
    expect(filterListingCollection([live()], { budget: "free" })).toHaveLength(0);
  });

  it("allocates reasoning headroom and rejects truncated provider output", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const fetch = vi.fn(async () => Response.json({ status: "incomplete", output_text: '{"city":"Miami"}', incomplete_details: { reason: "max_output_tokens" } }));
    vi.stubGlobal("fetch", fetch);
    const result = await createOpenAiResponse({ feature: "smart_search", maxOutputTokens: 200, messages: [{ role: "user", content: "Miami" }] });
    expect(result.ok).toBe(false);
    const args = fetch.mock.calls as unknown as Array<[string, RequestInit]>;
    const request = JSON.parse(String(args[0][1].body));
    expect(request).toMatchObject({ reasoning: { effort: "minimal" }, max_output_tokens: 1024, store: false });
  });

  it("validates API input and offers public help", async () => {
    const invalid = await POST(new Request("https://test/api/mobile/assistant", { method: "POST", body: "null" }));
    expect(invalid.status).toBe(400);
    const response = await POST(new Request("https://test/api/mobile/assistant", {
      method: "POST", body: JSON.stringify({ mode: "support", query: "Do I pay to request a booking?", aiConsent: false })
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ provider: "local_faq", cards: [], planJson: "" });
  });
});

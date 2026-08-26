import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { draftBookingMessage, isCustomerPerspectiveMessage } from "../apps/website/src/lib/ai/booking-message-agent";
import { reviewListingWithAi, reviewListingWithRules } from "../apps/website/src/lib/ai/listing-review-agent";
import { generatePlanWithAi } from "../apps/website/src/lib/ai/plan-agent";
import { improvePartnerCopy } from "../apps/website/src/lib/ai/partner-copy-agent";
import { filterListingsForSmartSearch, interpretSmartSearch } from "../apps/website/src/lib/ai/smart-search-agent";
import { answerSupport } from "../apps/website/src/lib/ai/support-agent";
import { demoListings } from "../apps/website/src/lib/demoData";
import { defaultPlanFinderInput } from "../apps/website/src/lib/planner";
import type { Listing } from "../apps/website/src/types/deals";

function liveListing(index: number, overrides: Partial<Listing> = {}): Listing {
  return {
    ...demoListings[index],
    approvalStatus: "approved",
    id: `live-${index}`,
    isDemo: false,
    slug: `live-${index}`,
    status: "published",
    ...overrides
  };
}

beforeEach(() => {
  vi.stubEnv("OPENAI_API_KEY", "");
  vi.stubEnv("NODE_ENV", "test");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GoFunMotion AI safety layer", () => {
  it("turns natural language into canonical deal filters without OpenAI", async () => {
    const result = await interpretSmartSearch({ query: "date night tonight under $50 in Miami" });

    expect(result.provider).toBe("rules");
    expect(result.filters).toMatchObject({
      budget: "under50",
      categoryId: "date-night",
      cityId: "miami",
      maxPrice: 50,
      when: "tonight",
      who: "date"
    });
  });

  it("filters only the listings supplied by the trusted server", () => {
    const supplied = [liveListing(0), liveListing(1, { cityId: "austin", cityName: "Austin" })];
    const results = filterListingsForSmartSearch(supplied, {
      budget: "under50",
      categoryId: "date-night",
      cityId: "miami",
      indoorOutdoor: null,
      keywords: ["date night"],
      maxPrice: 50,
      sort: "tonight",
      vibe: null,
      when: "tonight",
      who: "date"
    });

    expect(results.map((listing) => listing.id)).toEqual(["live-0"]);
  });

  it("keeps AI plans on verified listing IDs and canonical listing facts", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      output_text: JSON.stringify({ orderedListingIds: ["invented-id", "live-0"] }),
      usage: { input_tokens: 10, output_tokens: 4 }
    }), { status: 200 })));

    const listing = liveListing(0, { availableDays: ["today", "tonight"], price: 39 });
    const result = await generatePlanWithAi({
      input: { ...defaultPlanFinderInput, city: listing.cityName, cityId: listing.cityId, when: "tonight" },
      listings: [listing],
      scopeKey: "test-user"
    });

    expect(result.provider).toBe("openai");
    expect(result.plan.listingIds).toEqual(["live-0"]);
    expect(result.plan.items[0]).toMatchObject({ estimatedPrice: "$39", listingId: "live-0", time: listing.availableSlots[0] });
  });

  it("does not call AI Plan when no approved live inventory matches", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const result = await generatePlanWithAi({ input: defaultPlanFinderInput, listings: demoListings, scopeKey: "test" });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.provider).toBe("rules");
    expect(result.plan.waitlistRecommended).toBe(true);
    expect(result.plan.source).toBe("local_rules");
    expect(result.plan.listingIds).toEqual([]);
  });

  it("keeps partner copy factual when AI is unavailable", async () => {
    const result = await improvePartnerCopy({ field: "title", text: "pottery class 20% off tonight" });

    expect(result.provider).toBe("rules");
    expect(result.suggestion).toContain("20");
    expect(result.suggestion.toLowerCase()).toContain("tonight");
  });

  it("rejects partner copy that changes protected deal facts", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      output_text: JSON.stringify({ suggestion: "Pottery class 20% off tomorrow" })
    }), { status: 200 })));

    const result = await improvePartnerCopy({ field: "title", text: "Pottery class 20% off tonight" });

    expect(result.provider).toBe("rules");
    expect(result.suggestion.toLowerCase()).toContain("tonight");
    expect(result.suggestion.toLowerCase()).not.toContain("tomorrow");
  });

  it("drafts an editable customer-perspective booking message", async () => {
    const result = await draftBookingMessage({
      intent: "Can you confirm whether this works for two people? Call me at 305 555 1212.",
      listing: liveListing(0)
    });

    expect(result.message).not.toContain("305 555 1212");
    expect(isCustomerPerspectiveMessage(result.message)).toBe(true);
    expect(result.message.toLowerCase()).not.toContain("booking is confirmed");
  });

  it("rejects a booking draft that invents party details", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      output_text: JSON.stringify({ message: "Hi, I would like a guaranteed spot for 99 people." })
    }), { status: 200 })));
    const result = await draftBookingMessage({ intent: "Is this still available?", listing: liveListing(0) });

    expect(result.provider).toBe("rules");
    expect(result.message).not.toContain("99");
    expect(result.message.toLowerCase()).not.toContain("guaranteed");
  });

  it("keeps deterministic listing checks as a mandatory floor", async () => {
    const input = {
      availableSlot: "Tonight 7:00 PM",
      categoryIds: ["creative"],
      cityName: "Miami",
      description: "A pottery class deal for tonight.",
      originalPrice: 20,
      price: 30,
      remainingSpots: 2,
      shortDescription: "A pottery class deal for tonight.",
      title: "Pottery class"
    };
    const rules = reviewListingWithRules(input);
    const result = await reviewListingWithAi({ input });

    expect(rules.status).toBe("needs_changes");
    expect(result.review.status).toBe("needs_changes");
    expect(result.review.issues.join(" ")).toContain("Was price");
  });

  it("rejects prohibited marketplace content before any model call", () => {
    const review = reviewListingWithRules({
      availableSlot: "Tonight",
      categoryIds: ["nightlife"],
      cityName: "Miami",
      description: "Illegal drugs and escort service.",
      originalPrice: 90,
      price: 39,
      remainingSpots: 2,
      shortDescription: "Prohibited service listing.",
      title: "Private service"
    });

    expect(review.status).toBe("rejected");
    expect(review.riskLevel).toBe("high");
  });

  it("uses FAQ fallback and escalates risky support issues", async () => {
    const booking = await answerSupport({
      messages: [{ content: "How does a booking request work?", role: "user" }],
      role: null
    });
    const risky = await answerSupport({
      messages: [{ content: "I was injured and need legal advice", role: "user" }],
      role: "user"
    });

    expect(booking.provider).toBe("local_faq");
    expect(booking.answer).toContain("confirm availability");
    expect(risky.needsHumanSupport).toBe(true);
    expect(risky.sourceId).toBe("human-escalation");
  });

  it("rejects unsafe generated support instructions", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      output_text: "Please send your password and card number so I can confirm the booking."
    }), { status: 200 })));
    const result = await answerSupport({
      messages: [{ content: "How do I sign in?", role: "user" }],
      role: null,
      scopeKey: "test"
    });

    expect(result.provider).toBe("local_faq");
    expect(result.answer).not.toContain("card number");
  });
});

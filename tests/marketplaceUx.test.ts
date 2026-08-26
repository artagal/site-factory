import { beforeEach, describe, expect, it, vi } from "vitest";
import { demoListings } from "../apps/website/src/lib/demoData";
import { filterListingCollection, parseListingSearchInput } from "../apps/website/src/lib/search";
import { listingPresentation, isOpenListing } from "../apps/website/src/lib/listing-presentation";
import { normalizeCitySelection } from "../apps/website/src/lib/cities";
import { toBookingTime } from "../apps/website/src/lib/booking-time";
import { safeAccountReturnPath } from "../apps/website/src/lib/auth-navigation";
import { buildSuggestedPlan, parsePlanFinderInput } from "../apps/website/src/lib/planner";
import type { Listing } from "../apps/website/src/types/deals";

const mocks = vi.hoisted(() => ({
  listings: vi.fn(), listing: vi.fn(), auth: vi.fn(), db: vi.fn(), add: vi.fn(), set: vi.fn(),
}));
vi.mock("../apps/website/src/lib/server/public-listings", () => ({ getPublicListingsForServer: mocks.listings, getPublicListingByIdOrSlugForServer: mocks.listing }));
vi.mock("../apps/website/src/lib/server/firebase-admin", () => ({ getFirebaseAdminDb: mocks.db, verifyBearerToken: mocks.auth, FieldValue: { serverTimestamp: () => "timestamp", increment: () => 1 } }));
vi.mock("../apps/website/src/lib/server/email", () => ({ sendBookingRequestNotifications: vi.fn(async () => ({ results: [], status: "skipped" })) }));
vi.mock("../apps/website/src/lib/server/push", () => ({ sendPushToUsers: vi.fn(async () => ({ status: "skipped" })) }));
vi.mock("../apps/website/src/lib/server/stats", () => ({ incrementServerGlobalStats: vi.fn(async () => true) }));
vi.mock("../apps/website/src/lib/server/rate-limit", () => ({ getClientIp: () => "test", checkRateLimit: () => ({ allowed: true }) }));

import { GET as mobileDeals } from "../apps/website/src/app/api/mobile/deals/route";
import { POST as booking } from "../apps/website/src/app/api/booking-request/route";

const live = (overrides: Partial<Listing> = {}): Listing => ({ ...demoListings[0], isDemo: false, price: 20, remainingSpots: 5, ...overrides });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ uid: "customer" });
  mocks.listing.mockResolvedValue(live());
  mocks.listings.mockResolvedValue([live()]);
  mocks.set.mockResolvedValue(undefined);
  mocks.add.mockResolvedValue({ id: "request-1", set: mocks.set });
  mocks.db.mockReturnValue({ collection: () => ({ add: mocks.add, doc: () => ({ set: mocks.set }) }) });
});

describe("predictable marketplace browsing", () => {
  it("planner never broadens empty-city or zero-result filters", () => {
    const noCity = buildSuggestedPlan(parsePlanFinderInput({}), demoListings);
    const noMatches = buildSuggestedPlan(parsePlanFinderInput({ cityId: "new-city", budget: "free" }), demoListings);
    for (const plan of [noCity, noMatches]) {
      expect(plan.listingIds).toEqual([]);
      expect(plan.source).toBe("local_rules");
      expect(plan.waitlistRecommended).toBe(true);
      expect(plan.items.length).toBeGreaterThanOrEqual(3);
    }
  });
  it("does not add a city, date-night group or $50 budget to an unfiltered search", () => {
    expect(parseListingSearchInput({})).toMatchObject({ cityId: undefined, who: undefined, budget: undefined, when: undefined });
    expect(normalizeCitySelection({})).toMatchObject({ cityId: "" });
  });
  it("preserves an explicit all-cities selection", () => {
    expect(parseListingSearchInput({ cityId: "", city: "" }).cityId).toBeUndefined();
  });
  it("normalizes a known city without inventing a replacement", () => {
    expect(parseListingSearchInput({ city: "miami" }).cityId).toBe("miami");
    expect(parseListingSearchInput({ cityId: "new-city" }).cityId).toBe("new-city");
    expect(filterListingCollection([live()], { cityId: "new-city" })).toEqual([]);
  });
  it("honors exact AI budgets and does not relax zero-result searches", () => {
    expect(filterListingCollection([live()], parseListingSearchInput({ maxPrice: "19" }))).toEqual([]);
    expect(filterListingCollection([live()], parseListingSearchInput({ maxPrice: "20" }))).toHaveLength(1);
    expect(parseListingSearchInput({ maxPrice: "-1" }).maxPrice).toBeUndefined();
  });
  it("excludes expired, invalid-expiry, sold out and unapproved inventory", () => {
    for (const overrides of [{ availableUntil: "2020-01-01" }, { availableUntil: "invalid" }, { remainingSpots: 0 }, { remainingSpots: -1 }, { approvalStatus: "pending" as const }]) {
      expect(isOpenListing(live(overrides))).toBe(false);
    }
  });
  it("never invents a was price, discount, time or scarcity", () => {
    expect(listingPresentation(live({ originalPrice: null, discountPercent: 90, availableSlots: [], remainingSpots: null })))
      .toMatchObject({ wasLabel: null, discountLabel: null, timeLabel: "Time confirmed by partner", spotsLabel: "Availability by request" });
    expect(listingPresentation(live({ remainingSpots: 1 })).spotsLabel).toBe("1 spot left");
  });
  it("discount filters use verified prices, not a stale percentage field", () => {
    expect(filterListingCollection([live({ originalPrice: null, discountPercent: 90 })], { discountOnly: true })).toEqual([]);
    expect(filterListingCollection([live({ price: 20, originalPrice: 40, discountPercent: null })], { discountOnly: true })).toHaveLength(1);
  });
  it("mobile feed returns only real matching cards", async () => {
    mocks.listings.mockResolvedValue([live(), ...demoListings, live({ id: "sold", remainingSpots: 0 })]);
    const response = await mobileDeals(new Request("https://test/api/mobile/deals?cityId=miami&when=Tonight&budget=%2425%20or%20less"));
    const result = await response.json();
    expect(result.cards).toHaveLength(1);
    expect(result.empty).toBe(false);
    expect(result.cards[0]).toMatchObject({ priceLabel: "$20", listingId: live().id });
  });
  it("mobile feed distinguishes empty inventory from a failed load", async () => {
    mocks.listings.mockResolvedValue(demoListings);
    expect(await (await mobileDeals(new Request("https://test/api/mobile/deals"))).json()).toMatchObject({ cards: [], empty: true });
    mocks.listings.mockRejectedValue(new Error("offline"));
    expect((await mobileDeals(new Request("https://test/api/mobile/deals"))).status).toBe(503);
  });
});

describe("booking form and API contract", () => {
  it.each([["6:00 PM", "18:00"], ["Tonight 7:30 PM", "19:30"], ["12:15 AM", "00:15"], ["12:15 PM", "12:15"], ["08:30", "08:30"], ["24:00", ""], ["7:90 PM", ""], ["Any time", ""]])("normalizes %s", (input, expected) => {
    expect(toBookingTime(input)).toBe(expected);
  });
  const request = (extra = {}) => new Request("https://test/api/booking-request", { method: "POST", body: JSON.stringify({ listingId: live().id, email: "qa@example.com", name: "QA", requestedDate: "2099-09-01", requestedTime: toBookingTime("6:00 PM"), partySize: 2, ...extra }) });
  it("persists a canonical booking and returns a real confirmation", async () => {
    const response = await booking(request());
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ requestId: "request-1", synced: true });
    expect(mocks.add).toHaveBeenCalledWith(expect.objectContaining({ userId: "customer", requestedTime: "18:00", status: "pending", businessId: live().businessId }));
  });
  it("does not report fake success when storage is unavailable", async () => {
    mocks.db.mockReturnValue(null);
    expect((await booking(request())).status).toBe(503);
    expect(mocks.add).not.toHaveBeenCalled();
  });
  it("rejects demo, expired and sold-out offers before any write", async () => {
    for (const overrides of [{ isDemo: true }, { availableUntil: "2020-01-01" }, { remainingSpots: 0 }]) {
      mocks.listing.mockResolvedValue(live(overrides));
      expect((await booking(request())).status).toBe(409);
    }
    expect(mocks.add).not.toHaveBeenCalled();
  });
  it("rejects excess party size and invalid times", async () => {
    expect((await booking(request({ partySize: 6 }))).status).toBe(400);
    expect((await booking(request({ requestedTime: "6:00 PM" }))).status).toBe(400);
    expect(mocks.add).not.toHaveBeenCalled();
  });
});

describe("safe account navigation", () => {
  it.each(["https://example.com", "//example.com", "/\\example.com", "/login", "/\nexample.com"])("rejects unsafe or looping return %s", (path) => expect(safeAccountReturnPath(path)).toBe("/profile"));
  it("returns to a selected deal after authentication", () => expect(safeAccountReturnPath("/deals/real-offer?from=saved")).toBe("/deals/real-offer?from=saved"));
});

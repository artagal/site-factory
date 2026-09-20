import { describe, expect, it, vi, beforeEach } from "vitest";
import { demoBusinesses, demoListings } from "../apps/website/src/lib/demoData";
import { discoveryOffers } from "../apps/website/src/lib/mobile-discovery";

const mocks = vi.hoisted(() => ({ listings: vi.fn(), business: vi.fn() }));
vi.mock("../apps/website/src/lib/server/public-listings", () => ({ getPublicListingsForServer: mocks.listings, getPublicBusinessForServer: mocks.business }));
import { GET } from "../apps/website/src/app/api/mobile/discovery/route";

describe("mobile map and example catalog", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.listings.mockResolvedValue([]); });
  it("never mixes examples into live inventory", () => {
    expect(discoveryOffers(demoListings, demoBusinesses, "live")).toEqual([]);
  });
  it("provides explicit, non-bookable examples in five cities", () => {
    const offers = discoveryOffers(demoListings, demoBusinesses, "examples");
    expect(offers.length).toBeGreaterThanOrEqual(15);
    expect(new Set(offers.map((offer) => offer.cityId)).size).toBe(5);
    for (const offer of offers) {
      expect(offer.isDemo).toBe(true);
      expect(offer.canRequestBooking).toBe(false);
      expect(offer.listingId).toBe("");
      expect(offer.detailUrl).toBe("");
      expect(offer.mapUrl).toBe("");
      expect(offer.timeLabel).toMatch(/^Example:/);
      expect(offer.locationLabel).toContain("not a real partner");
      if (offer.imageUrl) expect(offer.imageUrl).toMatch(/^https:\/\//);
    }
  });
  it("filters exact city and record without guessing", () => {
    const offer = demoListings[0];
    expect(discoveryOffers(demoListings, demoBusinesses, "examples", offer.cityId, offer.id)).toHaveLength(1);
    expect(discoveryOffers(demoListings, demoBusinesses, "examples", "unknown-city")).toEqual([]);
  });
  it("rejects unapproved businesses, sold-out, expired and mismatched city offers", () => {
    const listing = { ...demoListings[0], isDemo: false };
    const business = { ...demoBusinesses.find((item) => item.id === listing.businessId)!, isDemo: false };
    expect(discoveryOffers([listing], [business], "live")).toHaveLength(1);
    expect(discoveryOffers([listing], [{ ...business, status: "pending" }], "live")).toEqual([]);
    expect(discoveryOffers([{ ...listing, remainingSpots: 0 }], [business], "live")).toEqual([]);
    expect(discoveryOffers([{ ...listing, availableUntil: "2020-01-01" }], [business], "live")).toEqual([]);
    expect(discoveryOffers([listing], [{ ...business, cityId: "wrong" }], "live")).toEqual([]);
  });
  it("keeps list-only offers when coordinates are invalid", () => {
    const listing = { ...demoListings[0], isDemo: false };
    const business = { ...demoBusinesses.find((item) => item.id === listing.businessId)!, isDemo: false, latitude: NaN };
    const [offer] = discoveryOffers([listing], [business], "live");
    expect(offer.hasLocation).toBe(false);
    expect(offer.latitude).toBeNull();
    expect(offer.canRequestBooking).toBe(true);
  });
  it("requires explicit examples mode and performs no Firebase reads for examples", async () => {
    const live = await GET(new Request("https://gofunmotion.com/api/mobile/discovery"));
    expect((await live.json()).cards).toEqual([]);
    mocks.listings.mockClear();
    const response = await GET(new Request("https://gofunmotion.com/api/mobile/discovery?catalog=examples&cityId=miami"));
    const data = await response.json();
    expect(data.cards).toHaveLength(3);
    expect(data.cities).toHaveLength(5);
    expect(data.mapUrl).toContain("catalog=examples&cityId=miami");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(mocks.listings).not.toHaveBeenCalled();
    expect(mocks.business).not.toHaveBeenCalled();
  });
  it("validates catalog and identifiers and handles outages", async () => {
    expect((await GET(new Request("https://gofunmotion.com/api/mobile/discovery?catalog=private"))).status).toBe(400);
    expect((await GET(new Request("https://gofunmotion.com/api/mobile/discovery?cityId=.."))).status).toBe(400);
    mocks.listings.mockRejectedValue(new Error("private details"));
    const response = await GET(new Request("https://gofunmotion.com/api/mobile/discovery"));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private details");
  });
});

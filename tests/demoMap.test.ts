import { describe, expect, it } from "vitest";
import { demoBusinesses, demoCities, demoListings } from "../apps/website/src/lib/demoData";
import { aggregateListingMapGroupsByCity, buildListingMapGroups, clusterNearbyListingMapGroups } from "../apps/website/src/lib/listing-map";

describe("multi-city demo marketplace", () => {
  it("keeps every demo offer attached to a local, mapped demo business", () => {
    const businessesById = new Map(demoBusinesses.map((business) => [business.id, business]));

    for (const listing of demoListings) {
      const business = businessesById.get(listing.businessId);
      expect(business).toBeDefined();
      expect(business?.cityId).toBe(listing.cityId);
      expect(business?.cityName).toBe(listing.cityName);
      expect(business?.latitude).toEqual(expect.any(Number));
      expect(business?.longitude).toEqual(expect.any(Number));
      expect(listing.isDemo).toBe(true);
      expect(listing.bookingMode).toBe("request");
      expect(listing.originalPrice).toBeGreaterThan(listing.price);
      expect(listing.remainingSpots).toBeGreaterThan(0);
    }
  });

  it("provides at least two companies and three offers in every demo city", () => {
    for (const city of demoCities) {
      expect(demoBusinesses.filter((business) => business.cityId === city.id).length).toBeGreaterThanOrEqual(2);
      expect(demoListings.filter((listing) => listing.cityId === city.id).length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("listing map groups", () => {
  it("groups all mapped offers by company", () => {
    const groups = buildListingMapGroups(demoListings, demoBusinesses);

    expect(groups).toHaveLength(demoBusinesses.length);
    expect(groups.flatMap((group) => group.listings)).toHaveLength(demoListings.length);
    expect(groups.find((group) => group.businessId === "demo-clay-house")?.listings).toHaveLength(2);
    const cityGroups = aggregateListingMapGroupsByCity(groups);
    expect(cityGroups).toHaveLength(demoCities.length);
    expect(clusterNearbyListingMapGroups(cityGroups)).toHaveLength(4);
    expect(clusterNearbyListingMapGroups(cityGroups).find((group) => group.cityName.includes("Los Angeles"))?.listings).toHaveLength(6);
  });

  it("excludes invalid coordinates and cross-city listing mismatches", () => {
    const listing = demoListings[0];
    const business = demoBusinesses.find((item) => item.id === listing.businessId)!;

    expect(buildListingMapGroups([{ ...listing, cityId: "austin" }], [business])).toHaveLength(0);
    expect(buildListingMapGroups([listing], [{ ...business, latitude: 120 }])).toHaveLength(0);
  });
});

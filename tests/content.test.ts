import { describe, expect, it } from "vitest";
import { buildSuggestedPlan, categories, cities, demoNotice, filterListings, listings, parsePlanFinderInput } from "../apps/website/src/lib/deals-data";
import { formatDuration, formatPrice } from "../apps/website/src/lib/format";
import { slugify } from "../apps/website/src/lib/slug";
import { getFactoryRoutes } from "../apps/website/src/lib/site-routes";

describe("GoFunMotion Deals marketplace content", () => {
  it("registers marketplace routes for sitemap generation", () => {
    const routes = getFactoryRoutes().map((route) => route.path);

    expect(routes).toContain("/");
    expect(routes).toContain("/find");
    expect(routes).toContain("/deals");
    expect(routes).toContain("/partner");
    expect(routes).toContain("/partner/apply");
    expect(routes).toContain("/partner/dashboard");
    expect(routes).toContain("/pricing");
    expect(routes).toContain("/saved");
    expect(routes).toContain("/profile");
    expect(routes).toContain("/admin");
    expect(routes).toContain("/cities/miami");
    expect(routes).toContain("/categories/date-night");
    expect(routes).toContain("/blog/date-night-ideas-under-50");
  });

  it("ships demo listings without presenting them as production partners", () => {
    expect(demoNotice.toLowerCase()).toContain("demo");
    expect(listings.length).toBeGreaterThanOrEqual(5);
    expect(listings.every((listing) => listing.isDemo)).toBe(true);
    expect(listings.every((listing) => listing.bookingMode === "request")).toBe(true);
    expect(listings.every((listing) => typeof listing.remainingSpots === "number")).toBe(true);
    expect(listings.every((listing) => listing.status === "published" && listing.approvalStatus === "approved")).toBe(true);
  });

  it("builds a rule-based plan with a listing match and backup suggestions", () => {
    const input = parsePlanFinderInput({
      budget: "under50",
      city: "Miami",
      indoorOutdoor: "indoor",
      timeAvailable: "2hours",
      vibe: "romantic",
      when: "tonight",
      who: "date"
    });
    const plan = buildSuggestedPlan(input);

    expect(plan.title).toContain("Miami");
    expect(plan.source).toBe("demo");
    expect(plan.items.length).toBeGreaterThanOrEqual(3);
    expect(plan.listingIds.length).toBeGreaterThan(0);
    expect(plan.backupSuggestions.length).toBeGreaterThan(0);
  });

  it("filters listings by city, budget, category, group type, and indoor/outdoor", () => {
    const results = filterListings({
      budget: "under50",
      categoryId: "date-night",
      city: "Miami",
      indoorOutdoor: "indoor",
      sort: "featured",
      who: "date"
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((listing) => listing.cityName === "Miami")).toBe(true);
    expect(results.every((listing) => listing.groupTypes.includes("date"))).toBe(true);
  });

  it("normalizes slugs and readable marketplace formatting", () => {
    expect(slugify("Date Night Under $50!")).toBe("date-night-under-50");
    expect(formatPrice(39, "USD")).toBe("$39");
    expect(formatDuration(150)).toBe("2h 30m");
  });

  it("keeps demo taxonomies broad enough for the launch surface", () => {
    expect(cities.map((city) => city.slug)).toEqual(expect.arrayContaining(["miami", "los-angeles", "new-york"]));
    expect(categories.map((category) => category.slug)).toEqual(expect.arrayContaining(["date-night", "family", "friends"]));
  });
});

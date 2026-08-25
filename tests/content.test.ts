import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildSuggestedPlan, categories, cities, demoNotice, filterListings, listings, parsePlanFinderInput } from "../apps/website/src/lib/deals-data";
import { formatDuration, formatPrice } from "../apps/website/src/lib/format";
import { dealFormatExamples, partnerDealTypes } from "../apps/website/src/lib/deal-taxonomy";
import { slugify } from "../apps/website/src/lib/slug";
import { getFactoryRoutes } from "../apps/website/src/lib/site-routes";

describe("GoFunMotion Deals marketplace content", () => {
  it("keeps Stripe scoped to authenticated partner subscriptions", () => {
    const websitePackage = JSON.parse(
      readFileSync(path.join(process.cwd(), "apps", "website", "package.json"), "utf8")
    ) as { dependencies?: Record<string, string> };
    const envExample = readFileSync(path.join(process.cwd(), "apps", "website", ".env.example"), "utf8");
    const schemaDoc = readFileSync(path.join(process.cwd(), "docs", "FIREBASE_SCHEMA_GOFUNMOTION_DEALS.md"), "utf8");

    expect(websitePackage.dependencies?.stripe).toBeDefined();
    expect(existsSync(path.join(process.cwd(), "apps", "website", "src", "app", "api", "partner", "billing", "checkout", "route.ts"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "apps", "website", "src", "app", "api", "partner", "billing", "portal", "route.ts"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "apps", "website", "src", "app", "api", "webhooks", "stripe", "route.ts"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "apps", "website", "src", "app", "api", "checkout", "route.ts"))).toBe(false);
    expect(existsSync(path.join(process.cwd(), "apps", "website", "public", "og", "gofunmotion-og.svg"))).toBe(false);
    expect(envExample).toContain("STRIPE_SECRET_KEY=");
    expect(envExample).toContain("STRIPE_WEBHOOK_SECRET=");
    expect(envExample).toContain("STRIPE_GROWTH_PRICE_ID=");
    expect(envExample).toContain("STRIPE_PRO_PRICE_ID=");
    expect(envExample).not.toContain("NEXT_PUBLIC_STRIPE");
    expect(envExample).not.toContain("GOFUNMOTION_ADMIN_CRON_SECRET");
    expect(schemaDoc).not.toContain("future_checkout");
  });

  it("redirects deprecated challenge routes into the Deals product surface", async () => {
    const configUrl = pathToFileURL(path.join(process.cwd(), "apps", "website", "next.config.mjs")).href;
    const { default: nextConfig } = await import(configUrl);
    const redirects = await nextConfig.redirects();

    expect(redirects).toEqual(expect.arrayContaining([
      {
        destination: "/find",
        permanent: false,
        source: "/challenge"
      },
      {
        destination: "/find?when=today",
        permanent: false,
        source: "/daily"
      },
      {
        destination: "/deals",
        permanent: false,
        source: "/leaderboard"
      }
    ]));
  });

  it("registers marketplace routes for sitemap generation", () => {
    const factoryRoutes = getFactoryRoutes();
    const routes = factoryRoutes.map((route) => route.path);

    expect(routes).toContain("/");
    expect(routes).toContain("/find");
    expect(routes).toContain("/deals");
    expect(factoryRoutes.find((route) => route.path === "/deals")?.priority).toBeGreaterThan(factoryRoutes.find((route) => route.path === "/find")?.priority ?? 0);
    expect(routes).toContain("/partner");
    expect(routes).toContain("/partner/apply");
    expect(routes).toContain("/pricing");
    expect(routes).toContain("/cities/miami");
    expect(routes).toContain("/categories/date-night");
    expect(routes).toContain("/blog/date-night-ideas-under-50");
    expect(routes).not.toContain("/categories");
    expect(routes).not.toContain("/challenge");
    expect(routes).not.toContain("/daily");
    expect(routes).not.toContain("/leaderboard");
    expect(routes).not.toContain("/login");
    expect(routes).not.toContain("/profile");
    expect(routes).not.toContain("/saved");
    expect(routes).not.toContain("/admin");
    expect(routes).not.toContain("/partner/dashboard");
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
    expect(partnerDealTypes.map((type) => type.id)).toEqual(expect.arrayContaining(["escape-rooms", "creative-studios", "kids-activity-centers"]));
    expect(dealFormatExamples).toEqual(expect.arrayContaining(["Tonight only", "Last-minute slot", "2 spots left"]));
  });
});

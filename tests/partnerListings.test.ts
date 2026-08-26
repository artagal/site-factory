import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ db: vi.fn(), verify: vi.fn(), review: vi.fn() }));
vi.mock("../apps/website/src/lib/server/firebase-admin", () => ({
  FieldValue: { serverTimestamp: () => "server-timestamp" },
  getFirebaseAdminDb: mocks.db,
  verifyBearerToken: mocks.verify
}));
vi.mock("../apps/website/src/lib/ai/listing-review-agent", () => ({
  listingReviewInputFromRecord: (input: unknown) => input,
  reviewListingWithAi: mocks.review
}));
vi.mock("../apps/website/src/lib/demo-mode", () => ({ isDemoDataEnabled: () => false }));

import { GET, POST } from "../apps/website/src/app/api/partner/listings/route";
import { filterListingCollection, sortListings } from "../apps/website/src/lib/search";
import { getPublicListingsForServer } from "../apps/website/src/lib/server/public-listings";

const records = new Map<string, Record<string, unknown>>();
const writes = vi.fn();
let nextId = 0;

function snapshot(id: string, record?: Record<string, unknown>) {
  return { id, exists: Boolean(record), data: () => record };
}

function request(body: Record<string, unknown>) {
  return new Request("https://example.test/api/partner/listings", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body)
  });
}

function query(name: string, filters: Array<[string, string, string]> = []) {
  return {
    where: (field: string, operator: string, value: string) => query(name, [...filters, [field, operator, value]]),
    get: async () => ({
      docs: [...records.entries()]
        .filter(([key, row]) => key.startsWith(`${name}/`) && filters.every(([field, operator, value]) => (
          operator === "array-contains" ? Array.isArray(row[field]) && row[field].includes(value) : row[field] === value
        )))
        .map(([key, row]) => snapshot(key.split("/")[1], row))
    })
  };
}

afterEach(() => vi.restoreAllMocks());

beforeEach(() => {
  records.clear();
  writes.mockClear();
  nextId = 0;
  mocks.verify.mockResolvedValue({ uid: "owner" });
  mocks.review.mockResolvedValue({ review: { status: "ready" }, provider: "rules" });
  records.set("businesses/business", { name: "Test studio", status: "approved", ownerIds: ["owner"], cityId: "new-york" });
  records.set("cities/new-york", { name: "New York", timezone: "America/New_York" });
  records.set("listings/deal", {
    id: "deal", businessId: "business", businessName: "Test studio", ownerIds: ["owner"],
    title: "Pottery night", shortDescription: "A short summary", description: "Guided class with all materials included.",
    categoryIds: ["creative", "date-night"], price: 39, originalPrice: 80, remainingSpots: 2,
    availableSlots: ["Tonight 7 PM"], availableFrom: "2099-07-24T23:00:00.000Z", availableUntil: "2099-07-25T01:00:00.000Z",
    status: "published", approvalStatus: "approved", images: ["https://example.test/image.jpg"],
    terms: "Adults only", durationMinutes: 120, groupTypes: ["family"], vibeTags: ["creative"],
    featured: true, promoted: true, slug: "pottery-night-original", viewCount: 51
  });
  mocks.db.mockReturnValue({
    getAll: async (...refs: Array<{ id: string; path: string }>) => refs.map((ref) => snapshot(ref.id, records.get(ref.path))),
    collection: (name: string) => ({
      ...query(name),
      doc: (id = `created-${++nextId}`) => ({
        id,
        path: `${name}/${id}`,
        get: async () => snapshot(id, records.get(`${name}/${id}`)),
        set: async (data: Record<string, unknown>) => {
          writes(`${name}/${id}`, data);
          records.set(`${name}/${id}`, { ...records.get(`${name}/${id}`), ...data });
        }
      })
    })
  });
});

describe("partner listing mobile edit contract", () => {
  it("preserves web details while editing the same deal and requires reapproval", async () => {
    const response = await POST(request({
      businessId: "business", listingId: "deal", title: "Updated pottery night", price: "35", saveMode: "submit",
      primaryCategoryId: "classes", featured: true, promoted: true, approvalStatus: "approved", ownerIds: ["attacker"], cityId: "fake-city"
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ listingId: "deal", status: "pending_approval" });
    expect(records.get("listings/deal")).toMatchObject({
      title: "Updated pottery night", price: 35, images: ["https://example.test/image.jpg"], terms: "Adults only",
      durationMinutes: 120, groupTypes: ["family"], vibeTags: ["creative"], categoryIds: ["classes", "date-night"],
      status: "pending_approval", approvalStatus: "pending", featured: false, promoted: false,
      ownerIds: ["owner"], cityId: "new-york", slug: "pottery-night-original", viewCount: 51
    });
  });

  it.each([
    { title: "Updated offer" },
    { availableSlot: "Tonight 7 PM" },
    { availableSlot: "Tonight 7 PM", availableSlots: ["Tonight 7 PM", "Tonight 9 PM"] },
    { availableFromMillis: 0, availableUntilMillis: 0 },
    { availableFromMillis: Date.parse("2099-07-24T23:00:00Z"), availableUntilMillis: Date.parse("2099-07-25T01:00:00Z") }
  ])("preserves all slots and days for an unchanged schedule: %j", async (body) => {
    const schedule = {
      availableSlots: ["Tonight 7 PM", "Tonight 9 PM"], availableDays: ["today", "tonight", "friday"],
      availableFrom: "2099-07-24T23:00:00.000Z", availableUntil: "2099-07-25T01:00:00.000Z"
    };
    records.set("listings/deal", { ...records.get("listings/deal"), ...schedule });
    const response = await POST(request({ businessId: "business", listingId: "deal", saveMode: "draft", ...body }));
    expect(response.status).toBe(200);
    expect(records.get("listings/deal")).toMatchObject(schedule);
  });

  it.each([
    { availableSlot: "Tomorrow 7 PM" },
    { availableSlots: ["Tomorrow 7 PM", "Tomorrow 9 PM"] }
  ])("does not retain tonight tags after explicit text rescheduling: %j", async (body) => {
    records.set("listings/deal", {
      ...records.get("listings/deal"), availableDays: ["today", "tonight"], availableFrom: null, availableUntil: null
    });
    const response = await POST(request({ businessId: "business", listingId: "deal", ...body }));
    expect(response.status).toBe(200);
    expect(records.get("listings/deal")?.availableDays).toEqual(["tomorrow"]);
    records.set("listings/deal", { ...records.get("listings/deal"), status: "published", approvalStatus: "approved" });
    const listings = await getPublicListingsForServer();
    expect(filterListingCollection(listings, { when: "tomorrow" })).toHaveLength(1);
    expect(filterListingCollection(listings, { when: "tonight" })).toHaveLength(0);
    expect(filterListingCollection(listings, { availability: "today" })).toHaveLength(0);
  });

  it("discovers an approved native deal by actual dates as the local day advances", async () => {
    const clock = vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-08-27T16:00:00Z"));
    const response = await POST(request({
      businessId: "business", listingId: "deal", requireAvailabilityWindow: true,
      availableFromMillis: Date.parse("2026-08-28T23:00:00Z"), availableUntilMillis: Date.parse("2026-08-29T01:00:00Z")
    }));
    expect(response.status).toBe(200);
    expect(records.get("listings/deal")).toMatchObject({ availableDays: [], status: "pending_approval", approvalStatus: "pending" });
    expect(await getPublicListingsForServer()).toEqual([]);
    records.set("listings/deal", { ...records.get("listings/deal"), status: "published", approvalStatus: "approved" });
    writes.mockClear();

    let listings = await getPublicListingsForServer();
    expect(filterListingCollection(listings, { when: "tomorrow" })).toHaveLength(1);
    expect(filterListingCollection(listings, { when: "today" })).toHaveLength(0);
    expect(filterListingCollection(listings, { when: "weekend" })).toHaveLength(0);

    clock.mockReturnValue(Date.parse("2026-08-28T16:00:00Z"));
    listings = await getPublicListingsForServer();
    expect(filterListingCollection(listings, { when: "today" })).toHaveLength(1);
    expect(filterListingCollection(listings, { when: "tonight" })).toHaveLength(1);
    expect(filterListingCollection(listings, { availability: "tonight" })).toHaveLength(1);
    expect(filterListingCollection(listings, { when: "tomorrow" })).toHaveLength(0);
    const daytime = { ...listings[0], id: "daytime", availableDays: ["today"] };
    expect(sortListings([daytime, ...listings], "tonight")[0].id).toBe("deal");

    clock.mockReturnValue(Date.parse("2026-08-29T01:00:00Z"));
    listings = await getPublicListingsForServer();
    for (const when of ["today", "tonight", "tomorrow", "weekend"] as const) {
      expect(filterListingCollection(listings, { when })).toHaveLength(0);
    }
    expect(records.get("listings/deal")?.availableDays).toEqual([]);
    expect(writes).not.toHaveBeenCalled();
  });

  it("uses a live city's timezone instead of a static city list or UTC day", async () => {
    vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-08-29T03:00:00Z"));
    records.set("businesses/business", { ...records.get("businesses/business"), cityId: "honolulu" });
    records.set("cities/honolulu", { name: "Honolulu", timezone: "Pacific/Honolulu" });
    expect((await POST(request({
      businessId: "business", listingId: "deal", requireAvailabilityWindow: true,
      availableFromMillis: Date.parse("2026-08-29T05:00:00Z"), availableUntilMillis: Date.parse("2026-08-29T07:00:00Z")
    }))).status).toBe(200);
    records.set("listings/deal", { ...records.get("listings/deal"), status: "published", approvalStatus: "approved", availableDays: ["weekend"] });
    const listings = await getPublicListingsForServer();
    expect(filterListingCollection(listings, { when: "today" })).toHaveLength(1);
    expect(filterListingCollection(listings, { when: "tonight" })).toHaveLength(1);
    expect(filterListingCollection(listings, { when: "weekend" })).toHaveLength(0);
  });

  it("matches native weekend availability only for the current or upcoming weekend", async () => {
    const clock = vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-08-28T16:00:00Z"));
    expect((await POST(request({
      businessId: "business", listingId: "deal", requireAvailabilityWindow: true,
      availableFromMillis: Date.parse("2026-08-30T23:00:00Z"), availableUntilMillis: Date.parse("2026-08-31T01:00:00Z")
    }))).status).toBe(200);
    records.set("listings/deal", { ...records.get("listings/deal"), status: "published", approvalStatus: "approved" });
    expect(filterListingCollection(await getPublicListingsForServer(), { when: "weekend" })).toHaveLength(1);
    clock.mockReturnValue(Date.parse("2026-08-31T16:00:00Z"));
    expect(filterListingCollection(await getPublicListingsForServer(), { when: "weekend" })).toHaveLength(0);
  });

  it("rejects edits to a listing belonging to another business", async () => {
    records.set("listings/deal", { ...records.get("listings/deal"), businessId: "other-business" });
    const response = await POST(request({ businessId: "business", listingId: "deal", price: "20" }));
    expect(response.status).toBe(404);
    expect(writes).not.toHaveBeenCalled();
  });

  it("keeps native dates and web labels in sync when rescheduling", async () => {
    const labelOnly = await POST(request({ businessId: "business", listingId: "deal", availableSlot: "Tomorrow 7 PM" }));
    expect(labelOnly.status).toBe(400);
    expect(writes).not.toHaveBeenCalled();
    const response = await POST(request({
      businessId: "business", listingId: "deal", requireAvailabilityWindow: true,
      availableFrom: "2099-07-25T23:00:00.000Z", availableUntil: "2099-07-26T01:00:00.000Z"
    }));
    expect(response.status).toBe(200);
    expect(records.get("listings/deal")).toMatchObject({
      availableFrom: "2099-07-25T23:00:00.000Z", availableUntil: "2099-07-26T01:00:00.000Z",
      availableSlots: [expect.stringContaining("Jul 25, 2099")], approvalStatus: "pending"
    });
  });

  it("rejects invalid date windows before any write", async () => {
    const response = await POST(request({ businessId: "business", listingId: "deal", availableUntilMillis: Date.parse("2099-07-20T20:00:00Z") }));
    expect(response.status).toBe(400);
    expect(writes).not.toHaveBeenCalled();
  });

  it("creates a native draft, then submits that same listing without duplicating it", async () => {
    records.delete("listings/deal");
    const body = {
      businessId: "business", title: "Pottery evening", description: "Guided pottery with materials included.",
      primaryCategoryId: "creative", originalPrice: "80", price: "39", remainingSpots: "2",
      availableFromMillis: Date.parse("2099-07-24T23:00:00Z"), availableUntilMillis: Date.parse("2099-07-25T01:00:00Z"),
      requireAvailabilityWindow: true, saveMode: "draft"
    };
    const created = await POST(request(body));
    expect(created.status).toBe(201);
    const { listingId } = await created.json() as { listingId: string };
    const submitted = await POST(request({ ...body, listingId, saveMode: "submit" }));
    expect(submitted.status).toBe(200);
    expect([...records.keys()].filter((key) => key.startsWith("listings/"))).toHaveLength(1);
    expect(records.get(`listings/${listingId}`)?.availableSlots).toEqual([expect.stringContaining("7:00 PM")]);
    expect(records.get(`listings/${listingId}`)?.approvalStatus).toBe("pending");
  });

  it("returns lossless native editor defaults only for the authenticated owner", async () => {
    const response = await GET(new Request("https://example.test/api/partner/listings"));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ count: 1, listings: [{ id: "deal", priceText: "39", originalPriceText: "80", remainingSpotsText: "2", categoryId: "creative" }] });
    mocks.verify.mockResolvedValue(null);
    expect((await GET(new Request("https://example.test/api/partner/listings"))).status).toBe(401);
  });
});

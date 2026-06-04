import { describe, expect, it } from "vitest";
import { GET as planGet, POST as planPost } from "../apps/website/src/app/api/plan/route";
import { POST as moderateAdminListingPost } from "../apps/website/src/app/api/admin/listings/moderate/route";
import { POST as createAdminCategoryPost } from "../apps/website/src/app/api/admin/categories/route";
import { POST as createAdminCityPost } from "../apps/website/src/app/api/admin/cities/route";
import { POST as approvePartnerApplicationPost } from "../apps/website/src/app/api/admin/partner-applications/approve/route";
import { POST as lookupAdminUserPost } from "../apps/website/src/app/api/admin/users/lookup/route";
import {
  USER_DOCUMENT_SUBCOLLECTIONS,
  USER_FIELD_OWNED_COLLECTIONS,
  USER_OWNED_COLLECTIONS,
  USER_TOP_LEVEL_DOCUMENTS
} from "../apps/website/src/lib/account-deletion";
import { POST as bookingPost } from "../apps/website/src/app/api/booking-request/route";
import { GET as citiesGet } from "../apps/website/src/app/api/cities/route";
import { GET as categoriesGet } from "../apps/website/src/app/api/categories/route";
import { DELETE as partnerListingDelete, PATCH as partnerListingPatch, POST as partnerListingPost } from "../apps/website/src/app/api/partner/listings/route";
import { POST as partnerBookingStatusPost } from "../apps/website/src/app/api/partner/booking-requests/status/route";
import { POST as partnerPost } from "../apps/website/src/app/api/partner-application/route";
import { POST as eventsPost } from "../apps/website/src/app/api/events/route";
import { GET as searchGet } from "../apps/website/src/app/api/search/route";
import { POST as trackPost } from "../apps/website/src/app/api/track/route";
import { POST as waitlistPost } from "../apps/website/src/app/api/waitlist/route";

function jsonRequest(url: string, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new Request(url, {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      ...headers
    },
    method: "POST"
  });
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe("GoFunMotion Deals API routes", () => {
  it("keeps account deletion scoped to current Deals user records", () => {
    expect([...USER_DOCUMENT_SUBCOLLECTIONS]).toEqual([
      "savedListings",
      "savedPlans"
    ]);
    expect([...USER_OWNED_COLLECTIONS]).toEqual(expect.arrayContaining([
      "savedListings",
      "savedPlans",
      "plans",
      "bookingRequests"
    ]));
    expect([...USER_TOP_LEVEL_DOCUMENTS]).toEqual([
      "customer_profiles",
      "provider_profiles",
      "subscriptions"
    ]);
    expect([...USER_FIELD_OWNED_COLLECTIONS]).toEqual(expect.arrayContaining([
      { collectionName: "favorites", fieldPath: "userId" },
      { collectionName: "device_tokens", fieldPath: "userId" },
      { collectionName: "booking_requests", fieldPath: "customerId" },
      { collectionName: "drops", fieldPath: "providerId" }
    ]));
    expect([...USER_DOCUMENT_SUBCOLLECTIONS, ...USER_OWNED_COLLECTIONS]).not.toContain("completedChallenges");
    expect([...USER_DOCUMENT_SUBCOLLECTIONS, ...USER_OWNED_COLLECTIONS]).not.toContain("savedChallenges");
  });

  it("returns a rule-based plan from GET and POST", async () => {
    const getResponse = await planGet(new Request("https://site-factory.test/api/plan?city=Miami&who=date&budget=under50&vibe=romantic"));
    const getJson = await readJson<{ plan: { items: unknown[]; title: string } }>(getResponse);

    expect(getResponse.status).toBe(200);
    expect(getJson.plan.title).toContain("Miami");
    expect(getJson.plan.items.length).toBeGreaterThanOrEqual(3);

    const postResponse = await planPost(jsonRequest("https://site-factory.test/api/plan", {
      budget: "under25",
      city: "Austin",
      vibe: "social",
      who: "friends"
    }));
    const postJson = await readJson<{ plan: { title: string } }>(postResponse);

    expect(postResponse.status).toBe(200);
    expect(postJson.plan.title).toContain("Austin");
  });

  it("searches only public approved listings", async () => {
    const response = await searchGet(new Request("https://site-factory.test/api/search?city=Miami&category=date-night&budget=under50&who=date"));
    const json = await readJson<{ count: number; listings: Array<{ approvalStatus: string; status: string }> }>(response);

    expect(response.status).toBe(200);
    expect(json.count).toBeGreaterThan(0);
    expect(json.listings.every((listing: { approvalStatus: string; status: string }) => listing.status === "published" && listing.approvalStatus === "approved")).toBe(true);
  });

  it("validates booking request auth and payload", async () => {
    const missingAuth = await bookingPost(jsonRequest("https://site-factory.test/api/booking-request", {
      email: "user@example.com",
      name: "Test User",
      partySize: 2,
      requestedDate: "2026-06-01",
      requestedTime: "19:00"
    }));

    expect(missingAuth.status).toBe(401);
  });

  it("accepts partner application and waitlist payloads without paid services", async () => {
    const citiesResponse = await citiesGet();
    const citiesJson = await readJson<{ cities: Array<{ id: string; label: string }> }>(citiesResponse);

    expect(citiesResponse.status).toBe(200);
    expect(citiesJson.cities.map((city) => city.id)).toContain("miami");

    const categoriesResponse = await categoriesGet();
    const categoriesJson = await readJson<{ categories: Array<{ id: string; label: string }> }>(categoriesResponse);

    expect(categoriesResponse.status).toBe(200);
    expect(categoriesJson.categories.map((category) => category.id)).toContain("creative");

    const partnerResponse = await partnerPost(jsonRequest("https://site-factory.test/api/partner-application", {
      businessName: "Demo Studio",
      categoryId: "creative",
      cityId: "miami",
      description: "A local studio that wants to list reviewed creative classes and last-minute activity deals.",
      email: "owner@example.com",
      ownerName: "Owner Name"
    }));
    const partnerJson = await readJson<{ synced: boolean }>(partnerResponse);

    expect(partnerResponse.status).toBe(201);
    expect(partnerJson.synced).toBe(false);

    const waitlistResponse = await waitlistPost(jsonRequest("https://site-factory.test/api/waitlist", {
      city: "Miami",
      email: "fan@example.com",
      interestType: "user"
    }));
    const waitlistJson = await readJson<{ synced: boolean }>(waitlistResponse);

    expect(waitlistResponse.status).toBe(201);
    expect(waitlistJson.synced).toBe(false);
  });

  it("rejects partner applications without a managed city selection", async () => {
    const response = await partnerPost(jsonRequest("https://site-factory.test/api/partner-application", {
      businessName: "Demo Studio",
      categoryId: "creative",
      city: "",
      cityId: "",
      description: "A local studio that wants to list reviewed creative classes and last-minute activity deals.",
      email: "owner@example.com",
      ownerName: "Owner Name"
    }));
    const json = await readJson<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(json.error).toContain("selected city");
  });

  it("tracks only allowed analytics events", async () => {
    const badResponse = await trackPost(jsonRequest("https://site-factory.test/api/track", {
      type: "old_product_event"
    }));

    expect(badResponse.status).toBe(400);

    const goodResponse = await trackPost(jsonRequest("https://site-factory.test/api/track", {
      metadata: { placement: "test" },
      sessionId: "test-session",
      type: "plan_generated"
    }));

    expect(goodResponse.status).toBe(200);
  });

  it("keeps the legacy analytics endpoint compatible with current Deals events", async () => {
    const response = await eventsPost(jsonRequest("https://site-factory.test/api/events", {
      metadata: { placement: "compatibility-test" },
      type: "plan_generated"
    }));
    const json = await readJson<{ ok: boolean }>(response);

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
  });

  it("validates partner listing editor input", async () => {
    const response = await partnerListingPost(jsonRequest("https://site-factory.test/api/partner/listings", {}));
    const json = await readJson<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(json.error).toContain("Choose a business");

    const patchResponse = await partnerListingPatch(jsonRequest("https://site-factory.test/api/partner/listings", {}));
    const patchJson = await readJson<{ error: string }>(patchResponse);

    expect(patchResponse.status).toBe(400);
    expect(patchJson.error).toContain("Choose a business");

    const deleteResponse = await partnerListingDelete(jsonRequest("https://site-factory.test/api/partner/listings", {}));
    const deleteJson = await readJson<{ error: string }>(deleteResponse);

    expect(deleteResponse.status).toBe(400);
    expect(deleteJson.error).toContain("Choose a business");
  });

  it("validates partner booking request status updates", async () => {
    const response = await partnerBookingStatusPost(jsonRequest("https://site-factory.test/api/partner/booking-requests/status", {
      requestId: "",
      status: "confirmed"
    }));
    const json = await readJson<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(json.error).toContain("requestId");
  });

  it("validates admin partner application approval payload", async () => {
    const response = await approvePartnerApplicationPost(jsonRequest("https://site-factory.test/api/admin/partner-applications/approve", {
      applicationId: "",
      ownerUid: ""
    }));
    const json = await readJson<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(json.error).toContain("applicationId");
  });

  it("validates admin listing moderation payload", async () => {
    const response = await moderateAdminListingPost(jsonRequest("https://site-factory.test/api/admin/listings/moderate", {
      action: "approve",
      listingId: ""
    }));
    const json = await readJson<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(json.error).toContain("listingId");
  });

  it("validates admin city and category create payloads", async () => {
    const cityResponse = await createAdminCityPost(jsonRequest("https://site-factory.test/api/admin/cities", {
      name: "",
      state: ""
    }));
    const cityJson = await readJson<{ error: string }>(cityResponse);

    expect(cityResponse.status).toBe(400);
    expect(cityJson.error).toContain("city name");

    const categoryResponse = await createAdminCategoryPost(jsonRequest("https://site-factory.test/api/admin/categories", {
      name: ""
    }));
    const categoryJson = await readJson<{ error: string }>(categoryResponse);

    expect(categoryResponse.status).toBe(400);
    expect(categoryJson.error).toContain("category name");
  });

  it("validates admin account lookup payload", async () => {
    const response = await lookupAdminUserPost(jsonRequest("https://site-factory.test/api/admin/users/lookup", {
      email: "not-an-email"
    }));
    const json = await readJson<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(json.error).toContain("valid account email");
  });

});

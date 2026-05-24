import { describe, expect, it } from "vitest";
import { GET as planGet, POST as planPost } from "../apps/website/src/app/api/plan/route";
import { POST as bookingPost } from "../apps/website/src/app/api/booking-request/route";
import { POST as partnerPost } from "../apps/website/src/app/api/partner-application/route";
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
    const partnerResponse = await partnerPost(jsonRequest("https://site-factory.test/api/partner-application", {
      businessName: "Demo Studio",
      category: "Creative",
      city: "Miami",
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

  it("tracks only allowed analytics events", async () => {
    const badResponse = await trackPost(jsonRequest("https://site-factory.test/api/track", {
      type: "challenge_completed"
    }));

    expect(badResponse.status).toBe(400);

    const goodResponse = await trackPost(jsonRequest("https://site-factory.test/api/track", {
      metadata: { placement: "test" },
      sessionId: "test-session",
      type: "plan_generated"
    }));

    expect(goodResponse.status).toBe(200);
  });
});

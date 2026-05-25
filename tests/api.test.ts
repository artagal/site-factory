import { describe, expect, it } from "vitest";
import { GET as planGet, POST as planPost } from "../apps/website/src/app/api/plan/route";
import { POST as approvePartnerApplicationPost } from "../apps/website/src/app/api/admin/partner-applications/approve/route";
import { POST as lookupAdminUserPost } from "../apps/website/src/app/api/admin/users/lookup/route";
import { POST as billingPortalPost } from "../apps/website/src/app/api/billing/partner-portal/route";
import { POST as bookingPost } from "../apps/website/src/app/api/booking-request/route";
import { POST as checkoutPost } from "../apps/website/src/app/api/checkout/partner-subscription/route";
import { POST as partnerPost } from "../apps/website/src/app/api/partner-application/route";
import { GET as searchGet } from "../apps/website/src/app/api/search/route";
import { POST as trackPost } from "../apps/website/src/app/api/track/route";
import { POST as waitlistPost } from "../apps/website/src/app/api/waitlist/route";
import { POST as stripeWebhookPost } from "../apps/website/src/app/api/webhooks/stripe/route";
import Stripe from "stripe";

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

  it("keeps paid partner checkout disabled until Stripe is configured", async () => {
    const invalidTier = await checkoutPost(jsonRequest("https://site-factory.test/api/checkout/partner-subscription", {
      tier: "starter"
    }));
    const invalidJson = await readJson<{ error: string }>(invalidTier);

    expect(invalidTier.status).toBe(400);
    expect(invalidJson.error).toContain("Growth or Pro");

    const missingStripe = await checkoutPost(jsonRequest("https://site-factory.test/api/checkout/partner-subscription", {
      tier: "growth"
    }));
    const missingJson = await readJson<{ error: string }>(missingStripe);

    expect(missingStripe.status).toBe(503);
    expect(missingJson.error).toContain("Stripe is not configured");
  });

  it("validates partner billing portal input", async () => {
    const response = await billingPortalPost(jsonRequest("https://site-factory.test/api/billing/partner-portal", {}));
    const json = await readJson<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(json.error).toContain("Choose a business");
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

  it("validates admin Firebase user lookup payload", async () => {
    const response = await lookupAdminUserPost(jsonRequest("https://site-factory.test/api/admin/users/lookup", {
      email: "not-an-email"
    }));
    const json = await readJson<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(json.error).toContain("valid Firebase Auth user email");
  });

  it("verifies Stripe webhooks before requiring Firebase Admin sync", async () => {
    const oldStripeKey = process.env.STRIPE_SECRET_KEY;
    const oldWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_SECRET_KEY = "sk_test_gofunmotion";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_gofunmotion";

    try {
      const payload = JSON.stringify({
        data: {
          object: {
            customer: "cus_test",
            id: "sub_test",
            metadata: {
              businessId: "business_test",
              product: "partner_subscription",
              tier: "growth"
            },
            object: "subscription",
            status: "active"
          }
        },
        id: "evt_test",
        object: "event",
        type: "customer.subscription.updated"
      });
      const signature = Stripe.webhooks.generateTestHeaderString({
        payload,
        secret: process.env.STRIPE_WEBHOOK_SECRET
      });

      const response = await stripeWebhookPost(new Request("https://site-factory.test/api/webhooks/stripe", {
        body: payload,
        headers: {
          "stripe-signature": signature
        },
        method: "POST"
      }));
      const json = await readJson<{ error: string }>(response);

      expect(response.status).toBe(503);
      expect(json.error).toContain("Firebase Admin is not configured");
    } finally {
      process.env.STRIPE_SECRET_KEY = oldStripeKey;
      process.env.STRIPE_WEBHOOK_SECRET = oldWebhookSecret;
    }
  });
});

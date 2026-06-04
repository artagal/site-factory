import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildBusinessBookingRequestEmail,
  sendBookingRequestNotifications,
  sendTransactionalEmail
} from "../apps/website/src/lib/server/email";
import { demoListings } from "../apps/website/src/lib/demoData";
import type { Listing } from "../apps/website/src/types/deals";

const originalEnv = {
  BOOKING_REQUEST_FALLBACK_EMAIL: process.env.BOOKING_REQUEST_FALLBACK_EMAIL,
  EMAIL_FROM: process.env.EMAIL_FROM,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY
};

function liveListing(): Listing {
  return {
    ...demoListings[0],
    email: "owner@example.com",
    isDemo: false
  };
}

function requestPayload() {
  return {
    businessId: "business_1",
    businessName: "Studio Test",
    businessOwnerIds: ["owner_1"],
    cityId: "miami",
    email: "customer@example.com",
    listingId: "listing_1",
    listingTitle: "Pottery Date Night",
    message: "Window seat if possible.",
    name: "Customer One",
    partySize: 2,
    phone: null,
    requestedDate: "2026-06-01",
    requestedTime: "7:00 PM"
  };
}

afterEach(() => {
  process.env.BOOKING_REQUEST_FALLBACK_EMAIL = originalEnv.BOOKING_REQUEST_FALLBACK_EMAIL;
  process.env.EMAIL_FROM = originalEnv.EMAIL_FROM;
  process.env.NEXT_PUBLIC_SITE_URL = originalEnv.NEXT_PUBLIC_SITE_URL;
  process.env.RESEND_API_KEY = originalEnv.RESEND_API_KEY;
  vi.unstubAllGlobals();
});

describe("transactional email notifications", () => {
  it("skips sending when email provider env vars are missing", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;

    const result = await sendTransactionalEmail({
      html: "<p>Hello</p>",
      subject: "Hello",
      text: "Hello",
      to: ["customer@example.com"]
    });

    expect(result.provider).toBe("disabled");
    expect(result.attempted).toBe(false);
    expect(result.ok).toBe(false);
  });

  it("builds business notifications only for live listings", () => {
    const demoEmail = buildBusinessBookingRequestEmail({
      listing: demoListings[0],
      request: requestPayload(),
      requestId: "request_1"
    });
    const liveEmail = buildBusinessBookingRequestEmail({
      listing: liveListing(),
      request: requestPayload(),
      requestId: "request_1"
    });

    expect(demoEmail).toBeNull();
    expect(liveEmail?.to).toEqual(["owner@example.com"]);
    expect(liveEmail?.subject).toContain("Pottery Date Night");
  });

  it("sends business and customer booking notifications through Resend", async () => {
    process.env.EMAIL_FROM = "GoFunMotion <notifications@gofunmotion.com>";
    process.env.NEXT_PUBLIC_SITE_URL = "https://gofunmotion.com";
    process.env.RESEND_API_KEY = "re_test";
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "email_1" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendBookingRequestNotifications({
      listing: liveListing(),
      request: requestPayload(),
      requestId: "request_1"
    });

    expect(result.status).toBe("sent");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const calls = fetchMock.mock.calls as unknown as Array<[string, RequestInit]>;
    const firstBody = JSON.parse(String(calls[0]?.[1]?.body ?? "")) as { from: string; subject: string; to: string[] };
    expect(firstBody.from).toContain("GoFunMotion");
    expect(firstBody.subject).toContain("New booking request");
    expect(firstBody.to).toEqual(["owner@example.com"]);
  });
});

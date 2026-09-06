import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ verifyIdToken: vi.fn() }));
vi.mock("firebase-admin/app", () => ({
  getApps: () => [{ name: "test" }],
  initializeApp: vi.fn(),
  cert: vi.fn()
}));
vi.mock("firebase-admin/auth", () => ({ getAuth: () => ({ verifyIdToken: mocks.verifyIdToken }) }));

import { verifyBearerToken } from "../apps/website/src/lib/server/firebase-admin";
import { GET as savedPlans } from "../apps/website/src/app/api/me/saved-plans/route";
import { GET as savedListings } from "../apps/website/src/app/api/me/saved-listings/route";
import { GET as bookingRequests } from "../apps/website/src/app/api/me/booking-requests/route";

const request = (authorization?: string) => new Request("https://test/api/me/saved-plans", {
  headers: authorization ? { authorization } : {}
});

beforeEach(() => { mocks.verifyIdToken.mockReset(); });

describe("Firebase bearer sessions", () => {
  it("requires a bearer token and verifies revocation for signed-in users", async () => {
    for (const header of [undefined, "Basic credentials", "Bearer"]) {
      expect(await verifyBearerToken(request(header))).toBeNull();
    }
    expect(mocks.verifyIdToken).not.toHaveBeenCalled();
    mocks.verifyIdToken.mockResolvedValue({ uid: "customer" });
    expect(await verifyBearerToken(request("bearer valid-token"))).toEqual({ uid: "customer" });
    expect(mocks.verifyIdToken).toHaveBeenCalledWith("valid-token", true);
  });

  it.each([
    "auth/argument-error", "auth/invalid-id-token", "auth/id-token-expired",
    "auth/id-token-revoked", "auth/user-disabled", "auth/user-not-found"
  ])("returns an auth failure instead of a server failure for %s", async (code) => {
    mocks.verifyIdToken.mockRejectedValue(Object.assign(new Error("Private token diagnostic"), { code }));
    for (const handler of [savedPlans, savedListings, bookingRequests]) {
      const response = await handler(request("Bearer invalid-token"));
      expect(response.status).toBe(401);
      expect(await response.text()).not.toContain("Private token diagnostic");
    }
  });

  it("does not disguise backend outages as invalid credentials", async () => {
    const outage = Object.assign(new Error("Certificate service unavailable"), { code: "auth/internal-error" });
    mocks.verifyIdToken.mockRejectedValue(outage);
    await expect(verifyBearerToken(request("Bearer token"))).rejects.toBe(outage);
  });
});

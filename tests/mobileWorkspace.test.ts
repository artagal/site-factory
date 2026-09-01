import { describe, expect, it } from "vitest";
import { GET, POST } from "../apps/website/src/app/api/mobile/workspace/route";
import { canCancelRequest, canReviewRequest, emailLink, mapLink, mobileId, mobilePaidTier, mobileRow, mobileSection, mobileWorkspace, phoneLink } from "../apps/website/src/lib/mobile-workspace";
import { parseMobileCommand } from "../apps/website/src/lib/server/mobile-workspace-write";
import { requireMobileAdmin, type MobileActor } from "../apps/website/src/lib/server/mobile-workspace-access";
import { workspaceRecord } from "../apps/website/src/lib/server/mobile-workspace-read";

describe("Native workspace contracts", () => {
  it("uses default-safe typed responses and rejects unknown sections", () => {
    expect(mobileWorkspace()).toMatchObject({ rows: [], canEdit: false, flag: false, hasMore: false, field1: "" });
    expect(mobileRow("one")).toMatchObject({ id: "one", mapUrl: "", referenceId: "" });
    expect(mobileSection("admin-users")).toBe("admin-users");
    expect(mobileSection("businessBilling")).toBeNull();
  });
  it("rejects path injection in document identifiers and commands", () => {
    for (const id of ["users/admin", "..", ".", "a\nadmin", "a".repeat(181)]) expect(mobileId(id)).toBe("");
    expect(() => parseMobileCommand({ action: "profile", id: "../admin" })).toThrow();
    expect(() => parseMobileCommand({ action: "promote-myself" })).toThrow();
    expect(() => parseMobileCommand([])).toThrow();
    expect(parseMobileCommand({ action: "profile", value1: " Name ", role: "admin" })).not.toHaveProperty("role");
    expect(parseMobileCommand({ action: "partner-listing-duplicate", id: "deal", businessId: "business" })).toMatchObject({ action: "partner-listing-duplicate", id: "deal" });
  });
  it("never trusts a profile role for admin authorization", () => {
    expect(() => requireMobileAdmin({ isAdmin: false } as MobileActor)).toThrow("Administrator access");
    expect(() => requireMobileAdmin({ isAdmin: true } as MobileActor)).not.toThrow();
  });
  it("rejects unsigned access for every private section and write", async () => {
    for (const section of ["profile", "requests", "request", "partner-inbox", "team", "admin-users", "admin-listings", "admin-audit"]) {
      expect((await GET(new Request(`https://site-factory.test/api/mobile/workspace?section=${section}`))).status).toBe(401);
    }
    const response = await POST(new Request("https://site-factory.test/api/mobile/workspace", { method: "POST", body: JSON.stringify({ action: "admin-business-status", id: "b", value1: "approved" }) }));
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("fails invalid queries rather than silently loading another record", async () => {
    expect((await GET(new Request("https://site-factory.test/api/mobile/workspace?section=nope"))).status).toBe(400);
    expect((await GET(new Request("https://site-factory.test/api/mobile/workspace?section=business&businessId=../admin"))).status).toBe(400);
  });
  it("shows reviews only after the confirmed date, scoped to the booking user", () => {
    const data = { userId: "customer", status: "confirmed", requestedDate: "2026-08-20" };
    const now = Date.parse("2026-08-22T12:00:00Z");
    expect(canReviewRequest(data, "customer", now)).toBe(true);
    expect(canReviewRequest(data, "other", now)).toBe(false);
    expect(canReviewRequest({ ...data, status: "pending" }, "customer", now)).toBe(false);
    expect(canReviewRequest(data, "customer", Date.parse("2026-08-20T10:00:00Z"))).toBe(false);
    expect(canReviewRequest({ ...data, requestedDate: "invalid" }, "customer", now)).toBe(false);
    expect(canCancelRequest("confirmed")).toBe(true);
    expect(canCancelRequest("cancelled")).toBe(false);
  });
  it("fails paid feature access closed when billing is stale or incomplete", () => {
    const now = Date.parse("2026-08-26T12:00:00Z");
    const subscription = { paidAccessEnabled: true, pricingTier: "pro", subscriptionStatus: "active", subscriptionCurrentPeriodEnd: "2026-09-01T00:00:00Z" };
    expect(mobilePaidTier(subscription, now)).toBe("pro");
    for (const patch of [{ subscriptionStatus: "past_due" }, { subscriptionCurrentPeriodEnd: "2026-08-01T00:00:00Z" }, { subscriptionCurrentPeriodEnd: undefined }, { paidAccessEnabled: false }]) {
      expect(mobilePaidTier({ ...subscription, ...patch }, now)).toBe("starter");
    }
  });
  it("never fabricates map locations or exposes raw provider data", () => {
    expect(mapLink(null, null)).toBe("");
    expect(mapLink(91, 0)).toBe("");
    expect(mapLink(0, Number.NaN)).toBe("");
    expect(mapLink(25.76, -80.19)).toContain("25.76,-80.19");
    const row = workspaceRecord("businesses", "b", { name: "Venue", stripeCustomerId: "private", ownerIds: ["owner"], email: "owner@example.test" });
    expect(row).not.toHaveProperty("stripeCustomerId");
    expect(row).not.toHaveProperty("ownerIds");
  });
  it("creates launchable contact links only from plausible contact data", () => {
    expect(emailLink("Partner@Example.com")).toBe("mailto:partner@example.com");
    expect(emailLink("not-an-email")).toBe("");
    expect(phoneLink("+1 (305) 555-0123")).toBe("tel:+13055550123");
    expect(phoneLink("123")).toBe("");
  });
});

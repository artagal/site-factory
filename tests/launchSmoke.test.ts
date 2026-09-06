import { describe, expect, it } from "vitest";
import { isSafeDemoPage, isValidPublicSearch } from "../scripts/smoke-launch";

describe("release smoke assertions", () => {
  const listing = { status: "published", approvalStatus: "approved" };
  it("accepts an explicit empty inventory without requiring fake offers", () => {
    expect(isValidPublicSearch({ ok: true, count: 0, listings: [] })).toBe(true);
    expect(isValidPublicSearch({ ok: true, count: 1, listings: [listing] })).toBe(true);
  });
  it.each([
    null, {}, { ok: false, count: 0, listings: [] },
    { ok: true, count: -1, listings: [] }, { ok: true, count: 2, listings: [listing] },
    { ok: true, count: 1, listings: [null] },
    { ok: true, count: 1, listings: [{ ...listing, status: "draft" }] },
    { ok: true, count: 1, listings: [{ ...listing, approvalStatus: "pending" }] }
  ])("rejects malformed or non-public search data: %j", (value) => {
    expect(isValidPublicSearch(value)).toBe(false);
  });
  const demo = '<meta name="robots" content="noindex, nofollow">Demo, not bookable. Booking requests are not open for this example.';
  it("allows disabled demos or clearly non-bookable, non-indexed examples", () => {
    expect(isSafeDemoPage(404, "Not found")).toBe(true);
    expect(isSafeDemoPage(200, demo)).toBe(true);
  });
  it.each([
    [500, demo], [200, ""], [200, demo.replace("noindex", "index")],
    [200, demo.replace("Booking requests are not open for this example.", "Request booking")]
  ] as const)("does not mistake unsafe demos or server errors for a pass", (status, body) => {
    expect(isSafeDemoPage(status, body)).toBe(false);
  });
});

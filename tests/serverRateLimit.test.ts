import { describe, expect, it } from "vitest";
import { checkRateLimit } from "../apps/website/src/lib/server/rate-limit";

describe("server rate limiter", () => {
  it("blocks requests after the configured limit", () => {
    const key = `test-${Date.now()}-${Math.random()}`;

    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(false);
  });
});

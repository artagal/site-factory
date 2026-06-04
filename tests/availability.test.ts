import { describe, expect, it } from "vitest";
import { inferAvailableDaysFromText, normalizeAvailableDays } from "../apps/website/src/lib/availability";

describe("listing availability helpers", () => {
  it("maps tonight slots into today and tonight filters", () => {
    expect(inferAvailableDaysFromText(["Tonight 8:30 PM"])).toEqual(["today", "tonight"]);
  });

  it("normalizes explicit days and inferred slot labels", () => {
    expect(normalizeAvailableDays(["Tomorrow"], ["Saturday 2:00 PM"])).toEqual(["tomorrow", "weekend"]);
  });
});

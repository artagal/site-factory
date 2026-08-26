import { describe, expect, it } from "vitest";
import { inferAvailableDaysFromText, normalizeAvailableDays, resolveAvailableDays } from "../apps/website/src/lib/availability";

describe("listing availability helpers", () => {
  it("maps tonight slots into today and tonight filters", () => {
    expect(inferAvailableDaysFromText(["Tonight 8:30 PM"])).toEqual(["today", "tonight"]);
  });

  it("normalizes explicit days and inferred slot labels", () => {
    expect(normalizeAvailableDays(["Tomorrow"], ["Saturday 2:00 PM"])).toEqual(["tomorrow", "weekend"]);
  });
});

describe("absolute listing availability", () => {
  const resolve = (from: string | null, until: string | null, now: string, timeZone = "America/New_York") => resolveAvailableDays({
    availableFrom: from, availableUntil: until, availableDays: ["today", "tonight", "tomorrow", "weekend"]
  }, { now: Date.parse(now), timeZone });

  it("keeps stored tags for undated schedules", () => {
    expect(resolveAvailableDays({ availableFrom: null, availableUntil: null, availableDays: ["today", "tonight"] }))
      .toEqual(["today", "tonight"]);
  });

  it("moves a dated deal from tomorrow to tonight and then expires it without stored tags", () => {
    const listing = { availableFrom: "2026-08-28T23:00:00Z", availableUntil: "2026-08-29T01:00:00Z", availableDays: [] };
    const at = (now: string) => resolveAvailableDays(listing, { now: Date.parse(now), timeZone: "America/New_York" });
    expect(at("2026-08-27T16:00:00Z")).toEqual(["tomorrow"]);
    expect(at("2026-08-28T16:00:00Z")).toEqual(["today", "tonight"]);
    expect(at("2026-08-29T01:00:00Z")).toEqual([]);
    expect(listing.availableDays).toEqual([]);
  });

  it("uses business-local dates even when UTC is already the next day", () => {
    expect(resolve("2026-08-29T05:00:00Z", "2026-08-29T07:00:00Z", "2026-08-29T03:00:00Z", "Pacific/Honolulu"))
      .toEqual(["today", "tonight"]);
    expect(resolve("2026-08-29T05:00:00Z", "2026-08-29T07:00:00Z", "2026-08-29T03:00:00Z", "UTC"))
      .toEqual(["today", "weekend"]);
  });

  it("distinguishes daytime from evening and excludes an expired interval", () => {
    expect(resolve("2026-08-28T14:00:00Z", "2026-08-28T17:00:00Z", "2026-08-28T12:00:00Z")).toEqual(["today"]);
    expect(resolve("2026-08-28T14:00:00Z", "2026-08-28T17:00:00Z", "2026-08-28T17:00:00Z")).toEqual([]);
    expect(resolve("2026-08-28T20:00:00Z", "2026-08-28T22:00:00Z", "2026-08-28T12:00:00Z")).toEqual(["today"]);
    expect(resolve("2026-08-28T20:00:00Z", "2026-08-28T22:00:00.001Z", "2026-08-28T12:00:00Z")).toEqual(["today", "tonight"]);
  });

  it("does not count an end at local midnight as availability tomorrow or on the weekend", () => {
    expect(resolve("2026-08-29T02:00:00Z", "2026-08-29T04:00:00Z", "2026-08-28T16:00:00Z"))
      .toEqual(["today", "tonight"]);
    expect(resolve("2026-08-29T02:00:00Z", "2026-08-29T05:00:00Z", "2026-08-28T16:00:00Z"))
      .toEqual(["today", "tonight", "tomorrow", "weekend"]);
  });

  it("matches the upcoming or current weekend, not a later weekend", () => {
    expect(resolve("2026-08-30T14:00:00Z", "2026-08-30T16:00:00Z", "2026-08-28T16:00:00Z")).toEqual(["weekend"]);
    expect(resolve("2026-08-30T14:00:00Z", "2026-08-30T16:00:00Z", "2026-08-30T12:00:00Z")).toEqual(["today", "weekend"]);
    expect(resolve("2026-09-05T14:00:00Z", "2026-09-05T16:00:00Z", "2026-08-30T12:00:00Z")).toEqual([]);
    expect(resolve("2026-09-05T14:00:00Z", "2026-09-05T16:00:00Z", "2026-08-31T12:00:00Z")).toEqual(["weekend"]);
  });

  it("handles a 23-hour spring-forward day and a 25-hour fall-back day", () => {
    expect(resolve("2026-03-09T04:00:00Z", "2026-03-09T05:00:00Z", "2026-03-08T05:30:00Z"))
      .toEqual(["tomorrow"]);
    expect(resolve("2026-11-02T04:00:00Z", "2026-11-02T05:00:00Z", "2026-11-01T04:30:00Z"))
      .toEqual(["today", "tonight", "weekend"]);
    expect(resolve("2026-11-01T05:45:00Z", "2026-11-01T06:15:00Z", "2026-11-01T05:30:00Z"))
      .toEqual(["today", "weekend"]);
  });

  it("handles month and year rollover", () => {
    expect(resolve("2027-01-01T05:00:00Z", "2027-01-01T06:00:00Z", "2026-12-31T17:00:00Z")).toEqual(["tomorrow"]);
  });

  it("uses UTC for missing or invalid city timezones", () => {
    expect(resolve("2026-08-29T05:00:00Z", "2026-08-29T07:00:00Z", "2026-08-29T03:00:00Z", "invalid/timezone"))
      .toEqual(["today", "weekend"]);
    expect(resolve("2026-08-29T05:00:00Z", "2026-08-29T07:00:00Z", "2026-08-29T03:00:00Z", ""))
      .toEqual(["today", "weekend"]);
  });

  it("supports open bounds and fails closed on malformed or reversed absolute windows", () => {
    expect(resolve(null, "2026-08-28T17:00:00Z", "2026-08-28T16:00:00Z")).toEqual(["today"]);
    expect(resolve("2026-08-28T23:00:00Z", null, "2026-08-28T16:00:00Z")).toEqual(["today", "tonight", "tomorrow", "weekend"]);
    expect(resolve("invalid", "2026-08-29T01:00:00Z", "2026-08-28T16:00:00Z")).toEqual([]);
    expect(resolve("2026-08-28T23:00:00Z", "invalid", "2026-08-28T16:00:00Z")).toEqual([]);
    expect(resolve("2026-08-29T01:00:00Z", "2026-08-28T23:00:00Z", "2026-08-28T16:00:00Z")).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { normalizePartnerListingInput, partnerListingEditorFields } from "../apps/website/src/lib/partner-listing-input";

const existing = {
  availableDays: ["friday"],
  availableFrom: "2099-07-24T23:00:00.000Z",
  availableSlots: ["Friday 7 PM"],
  availableUntil: "2099-07-25T01:00:00.000Z",
  categoryIds: ["creative", "date-night"],
  description: "Guided pottery with materials included.",
  images: ["https://example.test/pottery.jpg"],
  originalPrice: 80,
  price: 39,
  remainingSpots: 2,
  terms: "Adults only. Materials included."
};

describe("native partner listing input", () => {
  it("preserves fields omitted by the compact mobile editor", () => {
    const result = normalizePartnerListingInput({ title: "Updated pottery offer", price: "35" }, existing);
    expect(result.input).toMatchObject({ ...existing, price: "35", title: "Updated pottery offer" });
    expect(existing.price).toBe(39);
  });

  it("changes the primary category without deleting secondary categories", () => {
    const result = normalizePartnerListingInput({ primaryCategoryId: "classes" }, existing);
    expect(result.input?.categoryIds).toEqual(["classes", "date-night"]);
  });

  it("allows explicit clearing of optional values", () => {
    const result = normalizePartnerListingInput({ originalPrice: "", remainingSpots: "" }, existing);
    expect(result.input).toMatchObject({ originalPrice: "", remainingSpots: "" });
  });

  it.each(["", " ", "unknown", -1, 10001, Infinity, true, null])("rejects an invalid price instead of creating a free deal: %s", (price) => {
    expect(normalizePartnerListingInput({ price }, existing).error).toContain("Deal price");
  });

  it.each([-1, 0.5, "two", 501])("rejects invalid remaining capacity: %s", (remainingSpots) => {
    expect(normalizePartnerListingInput({ remainingSpots }, existing).error).toContain("Spots left");
  });

  it("keeps zero price and zero availability distinct from unknown values", () => {
    expect(normalizePartnerListingInput({ price: "0", remainingSpots: "0" }, existing).error).toBeUndefined();
    expect(partnerListingEditorFields({ price: 0, originalPrice: null, remainingSpots: 0 })).toMatchObject({
      originalPriceText: "", priceText: "0", remainingSpotsText: "0"
    });
  });

  it("converts native milliseconds to UTC and labels the slot in the business city timezone", () => {
    const result = normalizePartnerListingInput({
      availableFromMillis: Date.parse("2099-07-25T23:00:00Z"),
      availableUntilMillis: Date.parse("2099-07-26T01:00:00Z"),
      requireAvailabilityWindow: true,
      saveMode: "submit"
    }, existing, { timeZone: "America/New_York" });
    expect(result.input?.availableFrom).toBe("2099-07-25T23:00:00.000Z");
    expect(result.input?.availableUntil).toBe("2099-07-26T01:00:00.000Z");
    expect(result.input?.availableSlot).toContain("7:00 PM");
    expect(result.input?.availableDays).toEqual([]);
  });

  it("leaves existing dates unchanged when a picker is cancelled", () => {
    expect(normalizePartnerListingInput({ availableFromMillis: 0, availableUntilMillis: 0 }, existing).input)
      .toMatchObject({ availableFrom: existing.availableFrom, availableUntil: existing.availableUntil });
  });

  it("does not collapse existing slots when the initial dates were not changed", () => {
    const schedule = { ...existing, availableSlots: ["Friday 7 PM", "Friday 9 PM"] };
    const result = normalizePartnerListingInput({
      availableFromMillis: Date.parse(existing.availableFrom),
      availableUntilMillis: Date.parse(existing.availableUntil)
    }, schedule);
    expect(result.input?.availableSlots).toEqual(schedule.availableSlots);
    expect(result.input?.availableSlot).toBeUndefined();
    expect(result.input?.availableDays).toEqual(["friday"]);
  });

  it.each([
    { title: "Updated offer" },
    { availableSlot: "Friday 7 PM" },
    { availableSlot: " Friday 7 PM ", availableSlots: ["Friday 7 PM", "Friday 9 PM"] },
    { availableSlots: ["Friday 7 PM", "Friday 9 PM"] },
    { availableFromMillis: 0, availableUntilMillis: 0 }
  ])("preserves every slot and day when the schedule is unchanged: %j", (body) => {
    const schedule = { ...existing, availableSlots: ["Friday 7 PM", "Friday 9 PM"], availableDays: ["today", "tonight", "friday"] };
    const result = normalizePartnerListingInput(body, schedule);
    expect(result.input).toMatchObject({
      availableSlots: schedule.availableSlots,
      availableDays: schedule.availableDays,
      availableFrom: schedule.availableFrom,
      availableUntil: schedule.availableUntil
    });
    expect(result.input?.availableSlot).toBeUndefined();
  });

  it.each([
    { availableSlot: "Tomorrow 7 PM" },
    { availableSlots: ["Tomorrow 7 PM", "Tomorrow 9 PM"] }
  ])("replaces inherited day tags when text slots change: %j", (body) => {
    const schedule = { ...existing, availableFrom: null, availableUntil: null, availableSlots: ["Tonight 7 PM"], availableDays: ["today", "tonight"] };
    const result = normalizePartnerListingInput(body, schedule);
    expect(result.input?.availableDays).toEqual(["tomorrow"]);
    expect(result.input?.availableSlots).toEqual("availableSlot" in body ? [body.availableSlot] : body.availableSlots);
    expect(schedule.availableDays).toEqual(["today", "tonight"]);
  });

  it("uses explicitly supplied days instead of inherited ones on rescheduling", () => {
    const result = normalizePartnerListingInput({ availableSlot: "7 PM", availableDays: ["Tomorrow"] }, {
      ...existing, availableFrom: null, availableUntil: null, availableDays: ["today", "tonight"]
    });
    expect(result.input?.availableDays).toEqual(["tomorrow"]);
  });

  it("infers tags for legacy text schedules with no saved days", () => {
    const result = normalizePartnerListingInput({ title: "Updated" }, {
      price: 20, availableSlots: ["Tonight 7 PM"]
    });
    expect(result.input?.availableDays).toEqual(["today", "tonight"]);
  });

  it("rejects a text-only reschedule that contradicts an existing absolute window", () => {
    expect(normalizePartnerListingInput({ availableSlot: "Tomorrow 7 PM" }, existing).error).toContain("start and end dates");
  });

  it("regenerates the public label when the web editor updates ISO dates", () => {
    const result = normalizePartnerListingInput({
      availableFrom: "2099-07-25T23:00:00.000Z", availableUntil: "2099-07-26T01:00:00.000Z"
    }, existing, { timeZone: "America/New_York" });
    expect(result.input?.availableSlot).toContain("Jul 25, 2099");
    expect(result.input?.availableSlot).toContain("7:00 PM");
    expect(result.input?.availableDays).toEqual([]);
  });

  it.each([-1, 0.5, "0", "123", false, true, NaN, Infinity, -Infinity, 8.64e15 + 1, Number.MAX_SAFE_INTEGER])(
    "rejects invalid native date milliseconds without throwing: %s", (millis) => {
      for (const field of ["availableFromMillis", "availableUntilMillis"]) {
        expect(normalizePartnerListingInput({ [field]: millis }, existing).error).toContain("valid");
      }
    }
  );

  it("rejects reversed, malformed, missing, and expired date windows", () => {
    expect(normalizePartnerListingInput({ availableUntil: "2099-07-24T20:00:00Z" }, existing).error).toContain("after");
    expect(normalizePartnerListingInput({ availableFrom: "not a date" }, existing).error).toContain("valid");
    expect(normalizePartnerListingInput({ availableFromMillis: "invalid" }, existing).error).toContain("valid");
    expect(normalizePartnerListingInput({ price: 20, requireAvailabilityWindow: true }, undefined).error).toContain("start and end");
    expect(normalizePartnerListingInput({ requireAvailabilityWindow: true }, existing, {
      now: Date.parse("2099-07-26T00:00:00Z")
    }).error).toContain("expired");
  });

  it("uses explicit UTC when a city timezone is not configured", () => {
    const result = normalizePartnerListingInput({
      availableFromMillis: Date.parse(existing.availableFrom) + 60 * 60 * 1000
    }, existing, { timeZone: "invalid/timezone" });
    expect(result.input?.availableSlot).toContain("UTC");
  });
});

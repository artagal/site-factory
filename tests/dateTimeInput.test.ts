import { describe, expect, it } from "vitest";
import { formatLocalDateTimeInput, localDateTimeInputToIso } from "../apps/website/src/lib/format";

describe("partner local date fields", () => {
  it("converts a device-local date to UTC and back without changing its wall time", () => {
    const local = "2026-08-28T19:30";
    const iso = localDateTimeInputToIso(local);
    expect(iso).toBe(new Date(2026, 7, 28, 19, 30).toISOString());
    expect(formatLocalDateTimeInput(iso)).toBe(local);
  });

  it("keeps absent and invalid dates empty instead of throwing", () => {
    for (const value of ["", "invalid"]) {
      expect(formatLocalDateTimeInput(value)).toBe("");
      expect(localDateTimeInputToIso(value)).toBe("");
    }
  });
});

import { describe, expect, it } from "vitest";
import { getCanonicalCityOptions, getDefaultCityOption } from "../apps/website/src/lib/cities";
import type { City } from "../apps/website/src/types/deals";

const miami: City = {
  active: true,
  comingSoon: false,
  country: "US",
  description: "",
  heroImageUrl: null,
  id: "miami",
  name: "Miami",
  slug: "miami",
  state: "FL",
  timezone: "America/New_York"
};

describe("canonical city options", () => {
  it("deduplicates city spelling and counts each listing once", () => {
    const options = getCanonicalCityOptions([
      miami,
      { ...miami, id: "Miami", name: "miami", slug: "MIAMI", state: "fl" }
    ], [{ cityId: "miami" }]);

    expect(options).toHaveLength(1);
    expect(options[0]).toMatchObject({ active: true, dealCount: 1, id: "miami", state: "FL" });
  });

  it("does not silently default to a city without live supply", () => {
    const options = getCanonicalCityOptions([miami], []);

    expect(options[0]).toMatchObject({ active: false, comingSoon: true, dealCount: 0 });
    expect(getDefaultCityOption(options)).toBeUndefined();
  });
});

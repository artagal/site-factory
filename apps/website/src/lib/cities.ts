import { demoCities, demoListings } from "./demoData";
import { isDemoDataEnabled } from "./demo-mode";
import { slugify } from "./slug";
import type { City, Listing } from "../types/deals";

export type CityOption = Pick<City, "active" | "comingSoon" | "country" | "id" | "name" | "slug" | "state" | "timezone"> & {
  dealCount: number;
  label: string;
};

export function getCityLabel(city: Pick<City, "name" | "state">) {
  return city.state ? `${city.name}, ${city.state}` : city.name;
}

export function getCanonicalCityOptions(
  cities: City[] = demoCities,
  listings: Array<Pick<Listing, "cityId">> = isDemoDataEnabled() ? demoListings : []
): CityOption[] {
  const dealCounts = new Map<string, number>();
  for (const listing of listings) {
    const cityId = slugify(listing.cityId);
    if (cityId) dealCounts.set(cityId, (dealCounts.get(cityId) ?? 0) + 1);
  }

  const canonical = new Map<string, CityOption>();
  for (const city of cities) {
    const normalizedName = slugify(city.name);
    const normalizedState = slugify(city.state);
    const normalizedCountry = slugify(city.country);
    if (!normalizedName) continue;

    const dedupeKey = `${normalizedName}|${normalizedState}|${normalizedCountry}`;
    const slug = slugify(city.slug || city.id || city.name);
    const id = slug || normalizedName;
    const aliases = [...new Set([city.id, city.slug, id, normalizedName].map(slugify).filter(Boolean))];
    const dealCount = aliases.reduce((total, alias) => total + (dealCounts.get(alias) ?? 0), 0);
    const previous = canonical.get(dedupeKey);
    const mergedDealCount = Math.max(dealCount, previous?.dealCount ?? 0);
    const hasLiveSupply = mergedDealCount > 0;

    canonical.set(dedupeKey, {
      active: Boolean(hasLiveSupply && (city.active || previous?.active)),
      comingSoon: Boolean(!hasLiveSupply && (city.comingSoon || city.active || previous?.comingSoon || previous?.active)),
      country: city.country || previous?.country || "US",
      dealCount: mergedDealCount,
      id: previous?.dealCount && previous.dealCount > dealCount ? previous.id : id,
      label: getCityLabel(city),
      name: city.name.trim(),
      slug: previous?.dealCount && previous.dealCount > dealCount ? previous.slug : id,
      state: city.state.trim().toUpperCase(),
      timezone: city.timezone || previous?.timezone || "America/New_York"
    });
  }

  return [...canonical.values()]
    .sort((a, b) => Number(b.dealCount > 0) - Number(a.dealCount > 0) || a.name.localeCompare(b.name));
}

export function getDefaultCityOption(options: CityOption[] = getCanonicalCityOptions()) {
  return options.find((city) => city.dealCount > 0 && city.active);
}

export function findCityOption(value: string | null | undefined, options: CityOption[] = getCanonicalCityOptions()) {
  const normalized = slugify(value ?? "");
  if (!normalized) return undefined;

  return options.find((city) => {
    const aliases = [
      city.id,
      city.slug,
      city.name,
      city.label,
      `${city.name} ${city.state}`,
      `${city.name}, ${city.state}`
    ].map(slugify);
    return aliases.includes(normalized);
  });
}

export function normalizeCitySelection({
  city,
  cityId,
  options = getCanonicalCityOptions()
}: {
  city?: string | null;
  cityId?: string | null;
  options?: CityOption[];
}) {
  const selected = findCityOption(cityId, options) ?? findCityOption(city, options) ?? getDefaultCityOption(options);

  return {
    city: selected?.name ?? "",
    cityId: selected?.id ?? "",
    cityLabel: selected?.label ?? "Choose city",
    cityName: selected?.name ?? "",
    state: selected?.state ?? ""
  };
}

import { demoCities, demoListings } from "./demoData";
import { slugify } from "./slug";
import type { City, Listing } from "../types/deals";

export type CityOption = Pick<City, "active" | "comingSoon" | "country" | "id" | "name" | "slug" | "state" | "timezone"> & {
  dealCount: number;
  label: string;
};

export function getCityLabel(city: Pick<City, "name" | "state">) {
  return city.state ? `${city.name}, ${city.state}` : city.name;
}

export function getCanonicalCityOptions(cities: City[] = demoCities, listings: Array<Pick<Listing, "cityId">> = demoListings): CityOption[] {
  const dealCounts = new Map<string, number>();
  for (const listing of listings) {
    dealCounts.set(listing.cityId, (dealCounts.get(listing.cityId) ?? 0) + 1);
  }

  return cities
    .map((city) => ({
      active: city.active,
      comingSoon: city.comingSoon,
      country: city.country,
      dealCount: dealCounts.get(city.slug || city.id) ?? dealCounts.get(city.id) ?? 0,
      id: city.slug || city.id,
      label: getCityLabel(city),
      name: city.name,
      slug: city.slug || city.id,
      state: city.state,
      timezone: city.timezone
    }))
    .sort((a, b) => Number(b.dealCount > 0) - Number(a.dealCount > 0) || a.name.localeCompare(b.name));
}

export function getDefaultCityOption(options: CityOption[] = getCanonicalCityOptions()) {
  return options.find((city) => city.dealCount > 0 && city.active) ?? options.find((city) => city.active) ?? options[0];
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
    city: selected?.name ?? "Miami",
    cityId: selected?.id ?? "miami",
    cityLabel: selected?.label ?? "Miami, FL",
    cityName: selected?.name ?? "Miami",
    state: selected?.state ?? "FL"
  };
}

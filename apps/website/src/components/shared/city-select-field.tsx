"use client";

import { useEffect, useMemo, useState } from "react";
import { demoCities } from "../../lib/demoData";
import { getCanonicalCityOptions, normalizeCitySelection, type CityOption } from "../../lib/cities";

const fallbackCities = getCanonicalCityOptions(demoCities, []);

export function CitySelectField({
  compact = false,
  defaultCity,
  defaultCityId,
  dense = false,
  label = "City",
  name = "cityId",
  cityNameFieldName = "city",
  required = true
}: {
  cityNameFieldName?: string;
  compact?: boolean;
  dense?: boolean;
  defaultCity?: string;
  defaultCityId?: string;
  label?: string;
  name?: string;
  required?: boolean;
}) {
  const initial = useMemo(() => normalizeCitySelection({ city: defaultCity, cityId: defaultCityId, options: fallbackCities }), [defaultCity, defaultCityId]);
  const [cities, setCities] = useState<CityOption[]>(fallbackCities);
  const [selectedCityId, setSelectedCityId] = useState(initial.cityId);
  const [hasUserSelectedCity, setHasUserSelectedCity] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCities() {
      try {
        const response = await fetch("/api/cities", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as { cities?: CityOption[] } | null;
        const nextCities = response.ok && Array.isArray(payload?.cities) ? payload.cities : fallbackCities;
        if (cancelled) return;
        setCities(nextCities);
        setSelectedCityId((currentCityId) => {
          const nextSelection = normalizeCitySelection({
            city: hasUserSelectedCity ? undefined : defaultCity,
            cityId: hasUserSelectedCity ? currentCityId : defaultCityId ?? initial.cityId,
            options: nextCities
          });
          return nextSelection.cityId;
        });
      } catch {
        if (!cancelled) setCities(fallbackCities);
      }
    }

    void loadCities();
    return () => {
      cancelled = true;
    };
  }, [defaultCity, defaultCityId, hasUserSelectedCity, initial.cityId]);

  const selected = normalizeCitySelection({ cityId: selectedCityId, options: cities });

  return (
    <label className="block">
      <span className={dense ? "sr-only md:not-sr-only md:text-xs md:font-black md:uppercase md:tracking-[0.14em] md:text-white/45" : "text-xs font-black uppercase tracking-[0.14em] text-white/45"}>{label}</span>
      <select
        className={`${dense ? "mt-0 h-11 rounded-xl px-3 py-0 text-sm leading-normal md:mt-1 md:h-12 md:rounded-2xl md:px-4" : `${compact ? "mt-1" : "mt-2"} h-12 rounded-2xl px-4 py-0 text-sm leading-normal`} w-full border border-white/10 bg-black/28 font-bold text-white outline-none transition focus:border-lime-300`}
        name={name}
        onChange={(event) => {
          setHasUserSelectedCity(true);
          setSelectedCityId(event.target.value);
        }}
        required={required}
        value={selected.cityId}
      >
        <option className="bg-[#070816] text-white" disabled={required} value="">
          {required ? "Choose city" : "All cities"}
        </option>
        {cities.map((city) => (
          <option className="bg-[#070816] text-white" key={city.id} value={city.id}>
            {dense ? city.name : `${city.label}${city.dealCount > 0 ? ` - ${city.dealCount} deal${city.dealCount === 1 ? "" : "s"}` : city.comingSoon ? " - coming soon" : ""}`}
          </option>
        ))}
      </select>
      <input name={cityNameFieldName} type="hidden" value={selected.cityName} />
      <input name="cityLabel" type="hidden" value={selected.cityLabel} />
    </label>
  );
}

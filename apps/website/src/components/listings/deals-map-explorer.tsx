"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock3, Map as MapIcon, MapPin, ShieldCheck, Users } from "lucide-react";
import { formatPrice } from "../../lib/format";
import { aggregateListingMapGroupsByCity, buildListingMapGroups, clusterNearbyListingMapGroups } from "../../lib/listing-map";
import type { Business, Listing } from "../../types/deals";

const DealMapCanvas = dynamic(
  () => import("./deal-map-canvas").then((module) => module.DealMapCanvas),
  {
    loading: () => <div className="flex h-full min-h-[26rem] items-center justify-center bg-[var(--panel)] text-sm font-semibold text-[var(--muted-foreground)]">Loading deal map...</div>,
    ssr: false
  }
);

type CitySummary = {
  cityId: string;
  cityName: string;
  dealCount: number;
};

export function DealsMapExplorer({
  businesses,
  initialCityId,
  listings
}: {
  businesses: Business[];
  initialCityId?: string;
  listings: Listing[];
}) {
  const groups = useMemo(() => buildListingMapGroups(listings, businesses), [businesses, listings]);
  const cities = useMemo<CitySummary[]>(() => {
    const byCity = new Map<string, CitySummary>();
    for (const group of groups) {
      const current = byCity.get(group.cityId) ?? { cityId: group.cityId, cityName: group.cityName, dealCount: 0 };
      current.dealCount += group.listings.length;
      byCity.set(group.cityId, current);
    }
    return [...byCity.values()].sort((left, right) => left.cityName.localeCompare(right.cityName));
  }, [groups]);
  const safeInitialCityId = cities.some((city) => city.cityId === initialCityId) ? initialCityId! : "all";
  const [selectedCityId, setSelectedCityId] = useState(safeInitialCityId);
  const visibleGroups = selectedCityId === "all" ? groups : groups.filter((group) => group.cityId === selectedCityId);
  const visibleListings = visibleGroups.flatMap((group) => group.listings);
  const mapGroups = selectedCityId === "all"
    ? clusterNearbyListingMapGroups(aggregateListingMapGroupsByCity(groups))
    : visibleGroups;

  if (!groups.length) {
    return <section className="border-y border-[var(--border-subtle)] py-8" id="map">
      <h2 className="text-2xl font-black">Deal map</h2>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">Approved partners will appear here after a valid map location is added.</p>
    </section>;
  }

  return (
    <section aria-labelledby="deal-map-title" className="border-y border-[var(--border-subtle)] py-8" id="map">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent-lime)]"><MapIcon aria-hidden="true" size={17} />Explore by map</p>
          <h2 className="mt-2 text-2xl font-black md:text-3xl" id="deal-map-title">See what is open nearby.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">Switch cities, tap a marker, and compare every available example from that company.</p>
        </div>
        <p className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]"><ShieldCheck aria-hidden="true" className="text-[var(--accent-lime)]" size={16} />Demo markers use approximate locations</p>
      </div>

      <div aria-label="Map cities" className="scrollbar-none mt-5 flex gap-2 overflow-x-auto pb-2" role="group">
        <button aria-pressed={selectedCityId === "all"} className="deal-map-city-button" data-selected={selectedCityId === "all"} onClick={() => setSelectedCityId("all")} type="button">All cities <span>{listings.length}</span></button>
        {cities.map((city) => (
          <button aria-pressed={selectedCityId === city.cityId} className="deal-map-city-button" data-selected={selectedCityId === city.cityId} key={city.cityId} onClick={() => setSelectedCityId(city.cityId)} type="button">
            {city.cityName}<span>{city.dealCount}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 grid overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-strong)] lg:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.7fr)]">
        <div className="deal-map-shell min-h-[26rem] lg:min-h-[34rem]">
          <DealMapCanvas groups={mapGroups} />
        </div>
        <aside aria-label="Deals visible on the map" className="border-t border-[var(--border-subtle)] p-3 lg:max-h-[34rem] lg:overflow-y-auto lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between gap-3 px-1 pb-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Visible offers</p>
              <p className="mt-1 text-sm font-bold">{visibleListings.length} {visibleListings.length === 1 ? "deal" : "deals"}</p>
            </div>
            <MapPin aria-hidden="true" className="text-[var(--accent-cyan)]" size={22} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {visibleListings.map((listing) => (
              <Link className="deal-map-offer" href={`/deals/${listing.slug}`} key={listing.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[var(--muted-foreground)]">{listing.businessName}</p>
                    <h3 className="mt-1 text-sm font-black leading-5">{listing.title}</h3>
                  </div>
                  <span className="shrink-0 text-lg font-black text-[var(--accent-lime)]">{formatPrice(listing.price)}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-xs font-semibold text-[var(--muted-foreground)]">
                  <span className="inline-flex items-center gap-1"><Clock3 aria-hidden="true" size={14} />{listing.availableSlots[0] ?? "On request"}</span>
                  <span className="inline-flex items-center gap-1"><Users aria-hidden="true" size={14} />{listing.remainingSpots ?? "Check"} left</span>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

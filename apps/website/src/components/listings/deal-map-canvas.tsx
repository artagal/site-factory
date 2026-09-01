"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Clock3, MapPin, Users } from "lucide-react";
import { formatPrice } from "../../lib/format";
import type { ListingMapGroup } from "../../lib/listing-map";

function MapViewport({ groups }: { groups: ListingMapGroup[] }) {
  const map = useMap();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize({ animate: false });
      if (!groups.length) return;
      if (groups.length === 1) {
        map.setView([groups[0].latitude, groups[0].longitude], 13, { animate: false });
        return;
      }

      map.fitBounds(groups.map((group) => [group.latitude, group.longitude]), {
        animate: false,
        maxZoom: 13,
        padding: [44, 34]
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [groups, map]);

  return null;
}

function markerIcon(group: ListingMapGroup) {
  const label = group.listings.length > 1 ? `${group.listings.length} deals` : formatPrice(group.lowestPrice);
  return L.divIcon({
    className: "deal-map-marker-wrap",
    html: `<span class="deal-map-marker"><span class="deal-map-marker__dot"></span>${label}</span>`,
    iconAnchor: [34, 38],
    iconSize: [68, 38],
    popupAnchor: [0, -36]
  });
}

export function DealMapCanvas({ groups }: { groups: ListingMapGroup[] }) {
  const icons = useMemo(() => new Map(groups.map((group) => [group.businessId, markerIcon(group)])), [groups]);

  return (
    <MapContainer
      aria-label="Interactive map of local deal locations"
      center={[39.5, -98.35]}
      className="deal-map-canvas"
      scrollWheelZoom
      zoom={4}
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewport groups={groups} />
      {groups.map((group) => (
        <Marker
          alt={`${group.businessName}, ${group.listings.length} ${group.listings.length === 1 ? "deal" : "deals"}`}
          icon={icons.get(group.businessId)}
          key={group.businessId}
          position={[group.latitude, group.longitude]}
        >
          <Popup maxWidth={310} minWidth={260}>
            <div className="deal-map-popup">
              <p className="deal-map-popup__eyebrow"><MapPin aria-hidden="true" size={14} />{group.cityName}</p>
              <h3>{group.businessName}</h3>
              <p className="deal-map-popup__notice">Approximate location</p>
              <div className="deal-map-popup__list">
                {group.listings.map((listing) => (
                  <Link href={`/deals/${listing.slug}`} key={listing.id}>
                    <strong>{listing.title}</strong>
                    <span><Clock3 aria-hidden="true" size={13} />{listing.availableSlots[0] ?? "Time on request"}</span>
                    <span><Users aria-hidden="true" size={13} />{listing.remainingSpots ?? "Check"} spots · {formatPrice(listing.price)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

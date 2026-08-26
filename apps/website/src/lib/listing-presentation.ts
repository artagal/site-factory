import { availabilityDateMillis } from "./availability";
import { findCityOption } from "./cities";
import { formatPrice } from "./format";
import type { Listing } from "../types/deals";

export function isOpenListing(listing: Pick<Listing, "status" | "approvalStatus" | "availableUntil" | "remainingSpots">, now = Date.now()) {
  const expiry = availabilityDateMillis(listing.availableUntil);
  return listing.status === "published" && listing.approvalStatus === "approved"
    && (listing.remainingSpots === null || listing.remainingSpots > 0)
    && (!listing.availableUntil || (expiry !== null && expiry > now));
}

export function listingTimeLabel(listing: Pick<Listing, "availableFrom" | "availableDays" | "availableSlots" | "cityId">) {
  const start = availabilityDateMillis(listing.availableFrom);
  if (start !== null) {
    const city = findCityOption(listing.cityId);
    return new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      timeZone: city?.timezone ?? "UTC", timeZoneName: "short"
    }).format(start);
  }
  const slot = listing.availableSlots[0]?.trim();
  if (!slot) return "Time confirmed by partner";
  if (/today|tonight|tomorrow|weekend|mon|tue|wed|thu|fri|sat|sun|\d{4}-\d{2}-\d{2}/i.test(slot)) return slot;
  const day = listing.availableDays.includes("tonight") ? "tonight" : listing.availableDays[0];
  const labels: Record<string, string> = { today: "Today", tonight: "Tonight", tomorrow: "Tomorrow", weekend: "This weekend" };
  return day && labels[day] ? `${labels[day]} ${slot}` : slot;
}

export function listingDiscountPercent(listing: Pick<Listing, "price" | "originalPrice">) {
  const originalPrice = typeof listing.originalPrice === "number" && Number.isFinite(listing.originalPrice)
    && listing.originalPrice > listing.price ? listing.originalPrice : null;
  return originalPrice ? Math.floor((originalPrice - listing.price) / originalPrice * 100) : 0;
}

export function listingPresentation(listing: Listing) {
  const discount = listingDiscountPercent(listing);
  const spots = listing.remainingSpots;
  return {
    discountLabel: discount > 0 ? `${discount}% off` : null,
    imageUrl: listing.images.find((url) => /^https:\/\//i.test(url) || /^\/(?!\/)/.test(url)) ?? null,
    priceLabel: formatPrice(listing.price, listing.currency),
    spotsLabel: spots === null ? "Availability by request" : spots <= 0 ? "Sold out" : `${spots} ${spots === 1 ? "spot" : "spots"} left`,
    timeLabel: listingTimeLabel(listing),
    wasLabel: discount === 0 || listing.originalPrice === null ? null : `Was ${formatPrice(listing.originalPrice, listing.currency)}`
  };
}

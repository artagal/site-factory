import { listingPresentation, isOpenListing } from "./listing-presentation";
import { mapLink } from "./mobile-workspace";
import type { Business, Listing } from "../types/deals";

export type DiscoveryCatalog = "live" | "examples";

export function discoveryOffers(listings: Listing[], businesses: Business[], catalog: DiscoveryCatalog, cityId = "", id = "") {
  const byId = new Map(businesses.map((business) => [business.id, business]));
  return listings.filter((listing) => {
    const business = byId.get(listing.businessId);
    return Boolean(business && business.status === "approved" && business.cityId === listing.cityId
      && (catalog === "examples" ? listing.isDemo === true && business.isDemo === true : !listing.isDemo && !business.isDemo)
      && isOpenListing(listing) && Number.isFinite(listing.price) && listing.price >= 0
      && (!cityId || listing.cityId === cityId) && (!id || listing.id === id));
  }).slice(0, 100).map((listing) => {
    const business = byId.get(listing.businessId)!;
    const facts = listingPresentation(listing);
    const isDemo = catalog === "examples";
    const hasLocation = Boolean(mapLink(business.latitude, business.longitude));
    const image = facts.imageUrl ?? (isDemo && /pottery/i.test(listing.title) ? "/images/activities/pottery-workshop.jpg" : "");
    const imageUrl = image.startsWith("/") ? `https://gofunmotion.com${image}` : image;
    return {
      id: listing.id, listingId: isDemo ? "" : listing.id, title: listing.title,
      businessName: listing.businessName, cityId: listing.cityId, cityName: listing.cityName,
      description: listing.description, imageUrl, priceLabel: facts.priceLabel, wasLabel: facts.wasLabel ?? "",
      discountLabel: facts.discountLabel ?? "", timeLabel: `${isDemo ? "Example: " : ""}${facts.timeLabel}`,
      spotsLabel: isDemo ? `${listing.remainingSpots ?? "Several"} example spots` : facts.spotsLabel,
      durationLabel: `${listing.durationMinutes} minutes`, groupLabel: listing.groupTypes.join(" / "),
      environmentLabel: listing.indoorOutdoor, terms: listing.terms ?? "Partner terms apply.",
      isDemo, canRequestBooking: !isDemo, hasLocation,
      latitude: hasLocation ? business.latitude! : null, longitude: hasLocation ? business.longitude! : null,
      locationLabel: isDemo ? "Approximate example location, not a real partner" : business.addressLine1 || listing.cityName,
      detailUrl: isDemo ? "" : `/deals/${encodeURIComponent(listing.slug)}`,
      mapUrl: hasLocation && !isDemo ? mapLink(business.latitude, business.longitude) : ""
    };
  });
}

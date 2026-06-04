import type { Listing } from "../types/deals";

export function buildListingSeoDescription(
  listing: Pick<Listing, "bookingMode" | "businessName" | "cityName" | "shortDescription">
) {
  const requestLine =
    listing.bookingMode === "request"
      ? "Request availability before visiting."
      : "Check availability before visiting.";

  return `${listing.shortDescription} ${requestLine} Compare timing, pricing, and partner details in ${listing.cityName}.`;
}

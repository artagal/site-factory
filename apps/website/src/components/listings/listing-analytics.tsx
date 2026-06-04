"use client";

import { useEffect, type ReactNode } from "react";
import { trackEvent } from "../../lib/analytics";

export function ListingViewTracker({ listingId, listingSlug }: { listingId: string; listingSlug: string }) {
  useEffect(() => {
    trackEvent("listing_viewed", { listingId, listingSlug });
  }, [listingId, listingSlug]);

  return null;
}

export function ListingActionLink({
  children,
  className,
  href,
  listingId,
  listingSlug
}: {
  children: ReactNode;
  className: string;
  href: string;
  listingId: string;
  listingSlug: string;
}) {
  return (
    <a
      className={className}
      href={href}
      onClick={() => trackEvent("booking_request_started", { listingId, listingSlug })}
    >
      {children}
    </a>
  );
}

import type { Business, Listing } from "../types/deals";

export function canReadPublishedListing(listing: Pick<Listing, "approvalStatus" | "status">) {
  return listing.status === "published" && listing.approvalStatus === "approved";
}

export function canReadApprovedBusiness(business: Pick<Business, "status">) {
  return business.status === "approved";
}

export function isBusinessOwner(userId: string | null | undefined, ownerIds: string[] = []) {
  return Boolean(userId && ownerIds.includes(userId));
}

export function isAdminRole(role: unknown) {
  return role === "admin" || role === "superadmin";
}

export function canManageListing({
  isAdmin,
  listing,
  userId
}: {
  isAdmin: boolean;
  listing: Pick<Listing, "ownerIds">;
  userId: string | null | undefined;
}) {
  return isAdmin || isBusinessOwner(userId, listing.ownerIds);
}

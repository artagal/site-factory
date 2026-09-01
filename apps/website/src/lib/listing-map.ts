import type { Business, Listing } from "../types/deals";

export type ListingMapGroup = {
  businessId: string;
  businessName: string;
  cityId: string;
  cityName: string;
  latitude: number;
  listings: Listing[];
  longitude: number;
  lowestPrice: number;
  remainingSpots: number;
};

function hasValidCoordinates(business: Business) {
  return typeof business.latitude === "number"
    && Number.isFinite(business.latitude)
    && Math.abs(business.latitude) <= 90
    && typeof business.longitude === "number"
    && Number.isFinite(business.longitude)
    && Math.abs(business.longitude) <= 180;
}

export function buildListingMapGroups(listings: Listing[], businesses: Business[]): ListingMapGroup[] {
  const businessesById = new Map(businesses.map((business) => [business.id, business]));
  const listingsByBusiness = new Map<string, Listing[]>();

  for (const listing of listings) {
    const business = businessesById.get(listing.businessId);
    if (!business || !hasValidCoordinates(business) || business.cityId !== listing.cityId) continue;
    const current = listingsByBusiness.get(business.id) ?? [];
    current.push(listing);
    listingsByBusiness.set(business.id, current);
  }

  return [...listingsByBusiness.entries()].map(([businessId, groupedListings]) => {
    const business = businessesById.get(businessId)!;
    const orderedListings = [...groupedListings].sort((left, right) => left.price - right.price || left.title.localeCompare(right.title));
    return {
      businessId,
      businessName: business.name,
      cityId: business.cityId,
      cityName: business.cityName ?? orderedListings[0].cityName,
      latitude: business.latitude!,
      listings: orderedListings,
      longitude: business.longitude!,
      lowestPrice: orderedListings[0].price,
      remainingSpots: orderedListings.reduce((total, listing) => total + Math.max(0, listing.remainingSpots ?? 0), 0)
    };
  }).sort((left, right) => left.cityName.localeCompare(right.cityName) || left.lowestPrice - right.lowestPrice);
}

export function aggregateListingMapGroupsByCity(groups: ListingMapGroup[]): ListingMapGroup[] {
  const byCity = new Map<string, ListingMapGroup[]>();
  for (const group of groups) {
    const current = byCity.get(group.cityId) ?? [];
    current.push(group);
    byCity.set(group.cityId, current);
  }

  return [...byCity.entries()].map(([cityId, cityGroups]) => {
    const listings = cityGroups.flatMap((group) => group.listings)
      .sort((left, right) => left.price - right.price || left.title.localeCompare(right.title));
    return {
      businessId: `city-${cityId}`,
      businessName: `${cityGroups[0].cityName} offers`,
      cityId,
      cityName: cityGroups[0].cityName,
      latitude: cityGroups.reduce((total, group) => total + group.latitude, 0) / cityGroups.length,
      listings,
      longitude: cityGroups.reduce((total, group) => total + group.longitude, 0) / cityGroups.length,
      lowestPrice: listings[0].price,
      remainingSpots: listings.reduce((total, listing) => total + Math.max(0, listing.remainingSpots ?? 0), 0)
    };
  }).sort((left, right) => left.cityName.localeCompare(right.cityName));
}

function distanceInMiles(left: ListingMapGroup, right: ListingMapGroup) {
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const earthRadiusMiles = 3958.8;
  const latitudeDelta = toRadians(right.latitude - left.latitude);
  const longitudeDelta = toRadians(right.longitude - left.longitude);
  const latitudeA = toRadians(left.latitude);
  const latitudeB = toRadians(right.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(haversine));
}

export function clusterNearbyListingMapGroups(groups: ListingMapGroup[], maxDistanceMiles = 200): ListingMapGroup[] {
  const clusters: ListingMapGroup[][] = [];

  for (const group of groups) {
    const nearbyCluster = clusters.find((cluster) => cluster.some((item) => distanceInMiles(item, group) <= maxDistanceMiles));
    if (nearbyCluster) nearbyCluster.push(group);
    else clusters.push([group]);
  }

  return clusters.map((cluster) => {
    if (cluster.length === 1) return cluster[0];
    const cityNames = cluster.map((group) => group.cityName).sort((left, right) => left.localeCompare(right));
    const listings = cluster.flatMap((group) => group.listings)
      .sort((left, right) => left.price - right.price || left.title.localeCompare(right.title));
    const cityIds = cluster.map((group) => group.cityId).sort((left, right) => left.localeCompare(right));
    return {
      businessId: `cluster-${cityIds.join("-")}`,
      businessName: "Nearby city offers",
      cityId: cityIds.join("-"),
      cityName: cityNames.join(" + "),
      latitude: cluster.reduce((total, group) => total + group.latitude, 0) / cluster.length,
      listings,
      longitude: cluster.reduce((total, group) => total + group.longitude, 0) / cluster.length,
      lowestPrice: listings[0].price,
      remainingSpots: listings.reduce((total, listing) => total + Math.max(0, listing.remainingSpots ?? 0), 0)
    };
  }).sort((left, right) => left.cityName.localeCompare(right.cityName));
}

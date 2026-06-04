export const USER_DOCUMENT_SUBCOLLECTIONS = [
  "savedListings",
  "savedPlans"
] as const;

export const USER_OWNED_COLLECTIONS = [
  "savedListings",
  "savedPlans",
  "plans",
  "bookingRequests"
] as const;

export const USER_TOP_LEVEL_DOCUMENTS = [
  "customer_profiles",
  "provider_profiles",
  "subscriptions"
] as const;

export const USER_FIELD_OWNED_COLLECTIONS = [
  { collectionName: "favorites", fieldPath: "userId" },
  { collectionName: "device_tokens", fieldPath: "userId" },
  { collectionName: "reports", fieldPath: "reporterId" },
  { collectionName: "booking_requests", fieldPath: "customerId" },
  { collectionName: "booking_requests", fieldPath: "providerId" },
  { collectionName: "reviews", fieldPath: "customerId" },
  { collectionName: "reviews", fieldPath: "providerId" },
  { collectionName: "drops", fieldPath: "providerId" }
] as const;

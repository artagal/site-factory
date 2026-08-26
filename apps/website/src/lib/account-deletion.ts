export const USER_DOCUMENT_SUBCOLLECTIONS = [
  "deviceTokens",
  "notifications",
  "savedListings",
  "savedPlans"
] as const;

export const USER_OWNED_COLLECTIONS = [
  "plans",
  "bookingRequests",
  "reviews"
] as const;

export const USER_TOP_LEVEL_DOCUMENTS: readonly string[] = [];

export const USER_FIELD_OWNED_COLLECTIONS: readonly { collectionName: string; fieldPath: string }[] = [];

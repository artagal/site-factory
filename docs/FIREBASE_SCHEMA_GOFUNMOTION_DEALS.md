# Firebase Schema: GoFunMotion Deals

The canonical field-level model is documented in `docs/FIREBASE_DATA_MODEL.md`. This file records deployment queries, indexes, and security invariants shared by the web and FlutterFlow clients.

## Canonical Collections

- `users/{uid}`
- `admins/{uid}`
- `cities/{cityId}`
- `categories/{categoryId}`
- `businesses/{businessId}`
- `listings/{listingId}`
- `plans/{planId}`
- `users/{uid}/savedListings/{listingId}`
- `users/{uid}/savedPlans/{planId}`
- `users/{uid}/deviceTokens/{tokenId}`
- `users/{uid}/notifications/{notificationId}`
- `bookingRequests/{requestId}`
- `partnerApplications/{applicationId}`
- `waitlist/{entryId}`
- `globalStats/main`
- `analyticsEvents/{eventId}`
- `adminAuditLogs/{eventId}`
- `emailDeliveryEvents/{eventId}`

There are no top-level save collections. Legacy `drops`, `favorites`, `booking_requests`, `provider_profiles`, and `customer_profiles` are denied by the catch-all Firestore rule.

## Required Composite Indexes

Listings:

- `status + approvalStatus`, public approved listing feeds
- `status + approvalStatus + cityId`
- `status + approvalStatus + cityId + categoryIds`
- `status + approvalStatus + cityId + budgetTier`
- `status + approvalStatus + cityId + featured`
- `slug + status + approvalStatus`, public listing detail lookup
- `businessId + status`
- `businessId + updatedAt`, partner dashboard sorting
- `cityId + availableFrom`
- `categoryIds + cityId`

Businesses:

- `ownerIds + status`, web partner dashboard owner filters

Booking requests:

- `userId + createdAt`
- `businessId + createdAt`
- `listingId + createdAt`
- `businessOwnerIds + createdAt`
- `status + createdAt`

Operations:

- `partnerApplications.status + createdAt`
- `adminAuditLogs.targetType + targetId + createdAt`
- `emailDeliveryEvents.emailId + createdAt`

User save subcollections are read directly under a known user document and do not need top-level composite indexes.

## Security Invariants

- Public listing reads require `published`, `approved`, and non-demo data.
- Public business reads require approved, non-demo data.
- User profiles and nested saves, device tokens, and notifications are owner-only.
- Listing creation verifies business ownership and canonical city membership.
- Owners cannot change listing approval, `featured`, `promoted`, or `isDemo` fields.
- Booking requests can only target an approved, published, non-demo listing.
- Booking status transitions use the authenticated server API so notification delivery cannot be bypassed.
- Partner applications reference existing canonical city and category documents.
- Admin and delivery logs are server-written and immutable to clients.
- AI audit and usage records are server-only.

## Demo Policy

Local demo data is enabled outside production. Production demo rendering is off unless `NEXT_PUBLIC_ENABLE_DEMO_DATA=true`, and every rendered example remains explicitly labeled. Demo businesses/listings are never booking eligible.

## City Identity

All intake surfaces use a selected `cityId`; free-form city text is display/supporting data only. Admin city creation computes a normalized city/state/country key and reuses an existing city when the key matches, preventing capitalization and whitespace duplicates.

## Server Integrations

- OpenAI calls remain server-side and receive validated listing facts.
- Resend delivery webhooks require Svix signature verification over the raw body.
- FCM device tokens are user-owned; pushes are sent only by Firebase Admin.
- Stripe entitlement state belongs on `businesses/{businessId}`; private customer/subscription IDs belong in `businessBilling/{businessId}`. Both are updated only by signature-verified webhooks.

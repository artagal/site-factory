# GoFunMotion Deals Firebase Data Model

Date: 2026-08-24

This is the canonical Firestore model used by the web app and FlutterFlow app. Legacy BeautyDrop-style collections such as `drops`, `favorites`, `booking_requests`, `provider_profiles`, and `customer_profiles` are not part of GoFunMotion Deals.

## Identity And Access

### users/{uid}

Auth-backed profile. The `role` field is `user` or `business`; administrator access is never inferred from this field.

Core fields: `displayName`, `email`, `photoURL`, `phone`, `preferredCityId`, `preferredCategories`, `role`, `accountStatus`, `createdAt`, `updatedAt`, and `lastLoginAt`.

### admins/{uid}

Server-authoritative administrator record with `role` set to `admin` or `superadmin`. The first record is bootstrapped manually.

## Marketplace

### cities/{cityId}

Canonical city registry. IDs and `slug` values are normalized. `normalizedKey` is derived from normalized city, state, and country so capitalization and spacing cannot create duplicate cities.

Core fields: `name`, `slug`, `state`, `country`, `timezone`, `active`, `comingSoon`, `heroImageUrl`, `description`, `normalizedName`, `normalizedKey`, `createdAt`, and `updatedAt`.

### categories/{categoryId}

Canonical category registry with `name`, `slug`, `icon`, `description`, `accentColor`, `active`, and `sortOrder`.

### businesses/{businessId}

Partner profile and subscription entitlement source.

Core fields: `name`, `slug`, `description`, `ownerIds`, contact and address fields, `cityId`, `cityName`, `categories`, media fields, `status`, `verificationStatus`, `pricingTier`, `subscriptionStatus`, `stripeCustomerId`, `stripeSubscriptionId`, `paidAccessEnabled`, `isDemo`, `createdAt`, and `updatedAt`.

Public reads require `status == approved` and `isDemo != true`. Owners can edit profile fields but cannot change approval, verification, billing, or demo state.

### listings/{listingId}

Canonical deal/activity inventory.

Core fields: `id`, `businessId`, `businessName`, `ownerIds`, `cityId`, `cityName`, `title`, `slug`, `description`, `shortDescription`, `listingType`, `categoryIds`, `vibeTags`, `groupTypes`, `indoorOutdoor`, `durationMinutes`, `price`, `originalPrice`, `currency`, `discountPercent`, `budgetTier`, availability fields, `capacity`, `remainingSpots`, media and terms, booking contact fields, `bookingMode`, `status`, `approvalStatus`, `isDemo`, `featured`, `promoted`, metric counters, `createdAt`, and `updatedAt`.

Public reads require all of:

- `status == published`
- `approvalStatus == approved`
- `isDemo != true`

Partner-created listings start as `draft` or `pending_approval`, with `approvalStatus == pending`, `featured == false`, `promoted == false`, and `isDemo == false`.

## User Activity

### plans/{planId}

Generated plan persistence with `userId`, optional `sessionId`, `cityId`, validated planner `input`, generated copy, `items`, `listingIds`, `source`, `saved`, and `createdAt`. AI plans may only reference approved listing IDs supplied to the model.

### users/{uid}/savedListings/{listingId}

Idempotent saved listing with `listingId`, `savedAt`, and `listingSnapshot`.

### users/{uid}/savedPlans/{planId}

Idempotent saved plan with `planId`, `savedAt`, and `planSnapshot`.

### bookingRequests/{requestId}

Request-to-confirm booking record with `userId`, listing/business/city IDs, `businessOwnerIds`, contact fields, requested date/time, `partySize`, editable `message`, `status`, optional email-delivery state, `createdAt`, and `updatedAt`.

Statuses: `pending`, `contacted`, `confirmed`, `cancelled`, or `rejected`. Public clients cannot update status directly; the partner status API verifies ownership and sends notifications.

### users/{uid}/deviceTokens/{tokenId}

FCM registration with `token`, `platform`, `enabled`, `createdAt`, `updatedAt`, and `lastSeenAt`. A user can only manage their own tokens.

### users/{uid}/notifications/{notificationId}

Server-created in-app notification. Clients can only read their own notifications and update `isRead` and `readAt`.

## Intake And Operations

### partnerApplications/{applicationId}

Public business application using canonical `cityId` and `categoryId`, contact details, listing intent, status, and timestamps. Only admins can read or review applications.

### waitlist/{entryId}

Public create-only city interest with `email`, optional `cityId`, `city`, `interestType`, `source`, and `createdAt`.

### adminAuditLogs/{eventId}

Immutable server-side moderation audit record with actor, action, target, bounded metadata, request fingerprint, and timestamp. Admins may read but clients cannot write.

### emailDeliveryEvents/{eventId}

Idempotent, signature-verified Resend webhook events. Clients cannot read or write these records.

### analyticsEvents/{eventId}

Server-only product analytics events. No direct client access.

### globalStats/main

Read-only aggregate counts for public presentation. Only trusted server/admin operations write this document.

## Deletion Contract

Account deletion removes:

- `users/{uid}/deviceTokens`
- `users/{uid}/notifications`
- `users/{uid}/savedListings`
- `users/{uid}/savedPlans`
- top-level `plans` where `userId == uid`
- top-level `bookingRequests` where `userId == uid`

Business records and immutable audit/delivery evidence require an explicit administrative retention workflow instead of silent client deletion.

## Compatibility Policy

Both clients must use this model. Do not add compatibility writes to legacy top-level saves, `drops`, `favorites`, `booking_requests`, or profile split collections. During migration, reads from old records may be handled by a one-time trusted migration script, never by weakening public security rules.

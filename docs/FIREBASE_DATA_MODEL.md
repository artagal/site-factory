# Firebase Data Model

Date: 2026-06-04

## Scope

This is the target Firebase data model for the GoFunMotion FlutterFlow app. It is intentionally Firebase-native and should not copy BeautyDrop's Supabase table/RPC design.

The existing web prototype has some `businesses`, `listings`, and `bookingRequests` terminology. Future FlutterFlow-first work should normalize around `provider_profiles`, `drops`, and `booking_requests`. If the web app remains active during migration, keep a compatibility adapter or clearly documented mapping.

## Common Field Rules

- Use Firebase Auth uid for user-owned records.
- Use Firestore `Timestamp` values for `createdAt`, `updatedAt`, `deletedAt`, status timestamps, and expiry fields.
- Use explicit status strings instead of booleans for lifecycle state.
- Keep private contact information out of public drop documents unless it is intentionally public business contact info.
- Store moderation and admin-only fields behind admin rules.
- Store media in Firebase Storage and save public/download URLs or storage paths in Firestore.

## users/{uid}

Purpose: auth-backed identity, role, account status, and cross-role routing.

Fields:

- `uid`: string
- `role`: `customer` | `provider` | `admin`
- `displayName`: string
- `email`: string
- `phone`: string
- `photoUrl`: string
- `accountStatus`: `active` | `suspended` | `deleted` | `pending`
- `onboardingComplete`: boolean
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `deletedAt`: timestamp | null

Notes:

- Admin role should also be backed by `admin_users/{uid}` or custom claims before sensitive actions are allowed.
- Soft-deleted users should keep minimal audit-safe metadata and anonymized personal fields.

## customer_profiles/{uid}

Purpose: customer preferences and notification settings.

Fields:

- `uid`: string
- `preferredCategories`: array<string>
- `city`: string
- `location`: geopoint | null
- `notificationPreferences`: map
- `createdAt`: timestamp
- `updatedAt`: timestamp

## provider_profiles/{uid}

Purpose: provider/host business profile, location, media, verification, ratings, and reliability.

Fields:

- `uid`: string
- `businessName`: string
- `hostName`: string
- `description`: string
- `phone`: string
- `website`: string
- `socialLinks`: map
- `businessAddress`: string
- `city`: string
- `state`: string
- `postalCode`: string
- `country`: string
- `latitude`: number | null
- `longitude`: number | null
- `placeId`: string
- `timezone`: string
- `avatarUrl`: string
- `coverImageUrl`: string
- `verificationStatus`: `unverified` | `pending` | `verified` | `rejected` | `suspended`
- `ratingAverage`: number
- `ratingCount`: number
- `reliabilityScore`: number
- `reliabilityLabel`: string
- `createdAt`: timestamp
- `updatedAt`: timestamp

Notes:

- Public UI can show safe positive labels only.
- Raw reliability score and admin notes should be admin/provider-only.

## drops/{dropId}

Purpose: active marketplace inventory.

Fields:

- `id`: string
- `providerId`: string
- `title`: string
- `description`: string
- `category`: string
- `activityType`: string
- `dealType`: `last_minute` | `cancellation` | `slow_time` | `limited_spot` | `discount` | `experience`
- `status`: `draft` | `active` | `requested` | `booked` | `expired` | `cancelled` | `completed`
- `moderationStatus`: `draft` | `pending_review` | `approved` | `rejected` | `flagged`
- `startAt`: timestamp
- `endAt`: timestamp
- `durationMinutes`: number
- `regularPrice`: number
- `dealPrice`: number
- `discountPercent`: number
- `capacity`: number
- `spotsRemaining`: number
- `confirmationMode`: `instant_reserve` | `request_to_confirm`
- `locationFormatted`: string
- `city`: string
- `state`: string
- `postalCode`: string
- `latitude`: number | null
- `longitude`: number | null
- `placeId`: string
- `timezone`: string
- `imageUrl`: string
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `expiresAt`: timestamp

Public query eligibility:

- `status == active`
- `moderationStatus == approved`
- `expiresAt > now`
- `spotsRemaining > 0`

## booking_requests/{requestId}

Purpose: request-to-confirm workflow.

Fields:

- `id`: string
- `customerId`: string
- `providerId`: string
- `dropId`: string
- `status`: `pending` | `accepted` | `declined` | `cancelled_by_customer` | `cancelled_by_provider` | `completed` | `no_response` | `expired`
- `customerName`: string
- `customerPhone`: string
- `customerEmail`: string
- `message`: string
- `partySize`: number
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `acceptedAt`: timestamp | null
- `declinedAt`: timestamp | null
- `completedAt`: timestamp | null

Notes:

- Customers can read their own requests.
- Providers can read requests for their drops.
- Accepted request contact details should be shown only to the intended participants.

## favorites/{favoriteId}

Purpose: user-owned saved drops.

Fields:

- `id`: string
- `userId`: string
- `dropId`: string
- `createdAt`: timestamp

Recommended id:

```text
{userId}_{dropId}
```

This makes toggles idempotent and avoids duplicate favorites.

## reviews/{reviewId}

Purpose: reviews after completed booking requests.

Fields:

- `id`: string
- `bookingRequestId`: string
- `customerId`: string
- `providerId`: string
- `dropId`: string
- `rating`: number
- `text`: string
- `tags`: array<string>
- `wouldBookAgain`: boolean
- `moderationStatus`: `pending` | `approved` | `hidden` | `rejected`
- `createdAt`: timestamp
- `updatedAt`: timestamp

Rules:

- One review per completed booking request.
- Customer must own the completed booking request.
- Public surfaces show approved reviews only.

## reports/{reportId}

Purpose: user-submitted moderation reports.

Fields:

- `id`: string
- `reporterId`: string
- `targetType`: `drop` | `provider` | `review` | `booking_request` | `user`
- `targetId`: string
- `reason`: string
- `message`: string
- `status`: `new` | `in_review` | `resolved` | `dismissed`
- `createdAt`: timestamp
- `updatedAt`: timestamp

## admin_actions/{actionId}

Purpose: audit log for admin decisions.

Fields:

- `id`: string
- `adminId`: string
- `actionType`: string
- `targetType`: string
- `targetId`: string
- `reason`: string
- `createdAt`: timestamp

Admin action logs should be append-only from trusted code or strict admin rules.

## device_tokens/{tokenId}

Purpose: FCM device token registration.

Fields:

- `id`: string
- `userId`: string
- `token`: string
- `platform`: `ios` | `android` | `web`
- `isActive`: boolean
- `lastSeenAt`: timestamp
- `createdAt`: timestamp

Recommended id:

```text
{userId}_{platform}_{tokenHash}
```

Do not expose tokens to other users.

## subscriptions/{userId}

Purpose: provider plan and entitlement cache.

Fields:

- `userId`: string
- `plan`: `free_starter` | `pro_motion` | `venue_team_growth`
- `entitlement`: string
- `status`: `active` | `trialing` | `past_due` | `cancelled` | `expired` | `none`
- `currentPeriodEnd`: timestamp | null
- `source`: `manual` | `app_store` | `play_store` | `billing_provider` | `migration`
- `updatedAt`: timestamp

Notes:

- No payment checkout is part of the MVP unless explicitly approved later.
- Plan limits should be enforced through trusted logic and reflected in provider UI.

## Suggested Composite Indexes

- `drops`: `moderationStatus ASC`, `status ASC`, `city ASC`, `startAt ASC`
- `drops`: `moderationStatus ASC`, `status ASC`, `category ASC`, `startAt ASC`
- `drops`: `providerId ASC`, `status ASC`, `updatedAt DESC`
- `booking_requests`: `customerId ASC`, `createdAt DESC`
- `booking_requests`: `providerId ASC`, `status ASC`, `createdAt DESC`
- `favorites`: `userId ASC`, `createdAt DESC`
- `favorites`: `userId ASC`, `dropId ASC`
- `reviews`: `providerId ASC`, `moderationStatus ASC`, `createdAt DESC`
- `reports`: `status ASC`, `createdAt ASC`
- `admin_actions`: `targetType ASC`, `targetId ASC`, `createdAt DESC`

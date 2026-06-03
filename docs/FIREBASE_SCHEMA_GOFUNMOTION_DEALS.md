# Firebase Schema: GoFunMotion Deals

This document defines the target Firestore model for the GoFunMotion Deals pivot.

## users/{userId}

Purpose: consumer and business user account profile.

Fields:

- `displayName`: string
- `display_name`: string, FlutterFlow Auth profile field
- `email`: string
- `photoURL`: string | null
- `photo_url`: string | null, FlutterFlow Auth profile field
- `phone`: string | null
- `phone_number`: string | null, FlutterFlow Auth profile field
- `uid`: string, FlutterFlow Auth profile field
- `created_time`: timestamp, FlutterFlow Auth profile field
- `city`: string | null, FlutterFlow first-pass preference field
- `preferredCityId`: string | null
- `preferredCategories`: string[]
- `role`: `user` | `business`
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `lastLoginAt`: timestamp

Subcollections:

- `savedListings/{listingId}`
- `savedPlans/{planId}`

Note: the web app currently uses user subcollections for saves. The FlutterFlow first pass also has top-level `savedListings` and `savedPlans` collections, so Firestore rules support both shapes.

## admins/{userId}

Purpose: admin authorization.

Fields:

- `createdAt`: timestamp
- `role`: `admin` | `superadmin`

Bootstrap:

- First admin should be added manually in Firebase Console after signing in.
- Do not expose admin controls to users without an `admins/{uid}` document.

## cities/{cityId}

Purpose: city landing pages, city filters, and city activation.

Fields:

- `name`: string
- `slug`: string
- `state`: string
- `country`: string
- `timezone`: string
- `active`: boolean
- `comingSoon`: boolean
- `heroImageUrl`: string | null
- `description`: string
- `createdAt`: timestamp
- `updatedAt`: timestamp

## categories/{categoryId}

Purpose: marketplace categories.

Fields:

- `name`: string
- `slug`: string
- `icon`: string
- `description`: string
- `accentColor`: string
- `active`: boolean
- `sortOrder`: number

Suggested initial categories:

- Date Night
- Friends
- Family
- Kids
- Fitness
- Creative
- Food & Drink
- Nightlife
- Outdoor
- Wellness
- Classes
- Events

## businesses/{businessId}

Purpose: local business profiles and ownership.

Fields:

- `name`: string
- `ownerUserId`: string, FlutterFlow first-pass owner field
- `slug`: string
- `description`: string
- `ownerIds`: string[]
- `contactEmail`: string, FlutterFlow first-pass contact field
- `email`: string
- `phone`: string | null
- `website`: string | null
- `instagram`: string | null
- `addressLine1`: string
- `addressLine2`: string | null
- `cityId`: string
- `state`: string
- `country`: string
- `postalCode`: string
- `latitude`: number | null
- `longitude`: number | null
- `categories`: string[]
- `photos`: string[]
- `logoUrl`: string | null
- `status`: `pending` | `approved` | `rejected` | `suspended`
- `verificationStatus`: `unverified` | `verified`
- `createdAt`: timestamp
- `updatedAt`: timestamp

Security intent:

- Public reads only approved businesses.
- Owners can update allowed fields for their own businesses.
- Only admins can approve, reject, suspend, or verify.

## listings/{listingId}

Purpose: public activity, deal, event, class, and experience inventory.

Fields:

- `businessId`: string
- `businessRef`: document reference, FlutterFlow first-pass business reference
- `businessName`: string
- `cityId`: string
- `city`: string, FlutterFlow first-pass city label
- `cityName`: string
- `title`: string
- `slug`: string
- `description`: string
- `shortDescription`: string
- `listingType`: `deal` | `activity` | `event` | `class` | `experience`
- `categoryIds`: string[]
- `vibeTags`: string[]
- `groupTypes`: (`solo` | `date` | `friends` | `family` | `kids`)[]
- `indoorOutdoor`: `indoor` | `outdoor` | `either`
- `durationMinutes`: number
- `price`: number
- `originalPrice`: number | null
- `currency`: string
- `discountPercent`: number | null
- `budgetTier`: `free` | `under25` | `under50` | `under100` | `premium`
- `availableFrom`: timestamp | null
- `availableUntil`: timestamp | null
- `availableDays`: string[]
- `availableSlots`: string[]
- `capacity`: number | null
- `images`: string[]
- `terms`: string
- `cancellationNote`: string
- `bookingMode`: `request` | `external_link` | `phone`
- `bookingUrl`: string | null
- `phone`: string | null
- `email`: string | null
- `status`: `draft` | `pending_approval` | `published` | `paused` | `expired`
- `approvalStatus`: `pending` | `approved` | `rejected`
- `isApproved`: boolean, FlutterFlow first-pass approval field
- `category`: string, FlutterFlow first-pass category label
- `neighborhood`: string, FlutterFlow first-pass neighborhood label
- `priceLabel`: string, FlutterFlow first-pass price label
- `dealLabel`: string, FlutterFlow first-pass deal badge
- `imageUrl`: string | null, FlutterFlow first-pass image field
- `isDemo`: boolean
- `startsAt`: timestamp | null, FlutterFlow first-pass start field
- `endsAt`: timestamp | null, FlutterFlow first-pass end field
- `featured`: boolean
- `promoted`: boolean
- `viewCount`: number
- `saveCount`: number
- `requestCount`: number
- `clickCount`: number
- `createdAt`: timestamp
- `updatedAt`: timestamp

Security intent:

- Public reads only `status == published` and `approvalStatus == approved`.
- Business owners can create/edit their own listings but cannot self-approve, feature, or promote.
- Admins can approve/reject, feature, promote, pause, and manage all listings.

## plans/{planId}

Purpose: generated user plans.

Fields:

- `userId`: string | null
- `sessionId`: string | null
- `cityId`: string | null
- `input`: map
  - `city`: string
  - `when`: string
  - `who`: string
  - `budget`: string
  - `vibe`: string
  - `timeAvailable`: string
  - `indoorOutdoor`: string
- `generatedTitle`: string
- `generatedSummary`: string
- `items`: map[]
- `listingIds`: string[]
- `createdAt`: timestamp
- `saved`: boolean
- `source`: `local_rules` | `ai` | `demo`

Security intent:

- Users can read/write their own saved plans.
- Anonymous plan generation may remain API/local-only until a user saves.

## users/{userId}/savedListings/{listingId}

Purpose: saved deal/activity references for a user.

Fields:

- `listingId`: string
- `savedAt`: timestamp
- `listingSnapshot`: map

Security intent:

- User can read/write/delete only their own saved listings.

## users/{userId}/savedPlans/{planId}

Purpose: saved generated plans for a user.

Fields:

- `planId`: string
- `savedAt`: timestamp
- `planSnapshot`: map

Security intent:

- User can read/write/delete only their own saved plans.

## savedListings/{savedListingId}

Purpose: FlutterFlow first-pass top-level saved deal references.

Fields:

- `userId`: string
- `listingRef`: document reference
- `listingId`: string, optional web-compatible id
- `listingTitle`: string
- `city`: string
- `createdAt`: timestamp
- `savedAt`: timestamp, optional web-compatible timestamp
- `listingSnapshot`: map, optional web-compatible snapshot

Security intent:

- User can read/write/delete only records with `userId == auth.uid`.

## savedPlans/{savedPlanId}

Purpose: FlutterFlow first-pass top-level saved plan references.

Fields:

- `userId`: string
- `city`: string
- `persona`: string
- `when`: string
- `budget`: string
- `vibe`: string
- `summary`: string
- `createdAt`: timestamp
- `planId`: string, optional web-compatible id
- `savedAt`: timestamp, optional web-compatible timestamp
- `planSnapshot`: map, optional web-compatible snapshot

Security intent:

- User can read/write/delete only records with `userId == auth.uid`.

## bookingRequests/{requestId}

Purpose: request-based booking workflow before payments exist.

Fields:

- `userId`: string
- `listingId`: string
- `listingRef`: document reference, FlutterFlow first-pass listing reference
- `listingTitle`: string, FlutterFlow first-pass listing label
- `businessId`: string
- `cityId`: string
- `businessOwnerIds`: string[]
- `name`: string
- `contactName`: string, FlutterFlow first-pass contact field
- `email`: string
- `contactEmail`: string, FlutterFlow first-pass contact field
- `phone`: string | null
- `requestedDate`: string
- `requestedTime`: string
- `partySize`: number
- `message`: string
- `status`: `pending` | `contacted` | `confirmed` | `cancelled` | `rejected`
- `status`: `new`, allowed for FlutterFlow first-pass request creation
- `createdAt`: timestamp
- `updatedAt`: timestamp

Security intent:

- Authenticated users can create booking requests.
- Users can read their own requests.
- Business owners can read requests for their businesses/listings.
- Business owners can update status to contacted, confirmed, cancelled, or rejected.
- Admins can read all.

## partnerApplications/{applicationId}

Purpose: public business application intake.

Fields:

- `businessName`: string
- `ownerName`: string
- `contactName`: string, FlutterFlow first-pass contact field
- `email`: string
- `contactEmail`: string, FlutterFlow first-pass contact field
- `phone`: string | null
- `city`: string
- `category`: string
- `website`: string | null
- `instagram`: string | null
- `description`: string
- `averagePrice`: string
- `offersLastMinuteDeals`: boolean
- `message`: string
- `status`: `new` | `reviewed` | `approved` | `rejected`
- `status`: `pending`, allowed for FlutterFlow first-pass application creation
- `createdAt`: timestamp
- `updatedAt`: timestamp

Security intent:

- Anyone can create.
- Admins can read/update.
- Public cannot read applications.

## waitlist/{entryId}

Purpose: city and product waitlist.

Fields:

- `email`: string
- `city`: string | null
- `interestType`: `user` | `business`
- `interest`: string, FlutterFlow first-pass interest label
- `source`: string
- `createdAt`: timestamp

Security intent:

- Anyone can create.
- Public cannot read.
- Admins can read.

## globalStats/main

Purpose: public aggregate platform stats.

Fields:

- `plansGenerated`: number
- `listingsViewed`: number
- `bookingRequests`: number
- `activeCities`: number
- `activeListings`: number
- `partnerApplications`: number
- `updatedAt`: timestamp

Security intent:

- Public can read.
- Clients cannot write directly.
- Update through trusted server routes or Cloud Functions.

## analyticsEvents/{eventId}

Purpose: lightweight product validation and funnel analytics.

Fields:

- `userId`: string | null
- `sessionId`: string
- `type`: string
- `metadata`: map
- `createdAt`: timestamp

Suggested event types:

- `hero_cta_click`
- `plan_generated`
- `listing_viewed`
- `listing_saved`
- `plan_saved`
- `booking_request_started`
- `booking_request_submitted`
- `partner_application_submitted`
- `waitlist_submitted`
- `login_clicked`

Security intent:

- Prefer writes through `/api/track`.
- Do not expose broad public reads.

## Required Composite Indexes

Prepare indexes for:

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
- `isApproved + status + createdAt`, FlutterFlow first-pass approved listing feeds
- `isApproved + status + city`, FlutterFlow first-pass public listing filters
- `isApproved + city + category`, FlutterFlow first-pass category filters
- `businessRef + status`, FlutterFlow first-pass partner listing filters

Businesses:

- `ownerUserId + status`, FlutterFlow first-pass partner dashboard filters
- `ownerIds + status`, web partner dashboard owner filters

Top-level saves:

- `savedListings.userId + createdAt`
- `savedPlans.userId + createdAt`

Booking requests:

- `userId + createdAt`
- `businessId + createdAt`
- `listingId + createdAt`
- `businessOwnerIds + createdAt`
- `status + createdAt`

Partner applications:

- `status + createdAt`

## Future Optional Integrations

Do not add these yet:

- Stripe checkout.
- OpenAI, Gemini, or Vertex AI.
- Google Places.
- Ticketmaster.
- Eventbrite.

The schema is prepared so these can be added later through server-side APIs without exposing secrets to the client.

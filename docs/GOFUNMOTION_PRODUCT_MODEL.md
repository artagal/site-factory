# GoFunMotion Product Model

Date: 2026-06-04

## Product Definition

GoFunMotion is a last-minute entertainment and activity marketplace. Customers discover fun local options, save drops, request or reserve spots, track request status, and review completed experiences. Providers and hosts list real open spots, cancellations, slow-time deals, or limited-time entertainment/activity opportunities.

GoFunMotion is not a full event management system, full ticketing platform, or enterprise venue-management SaaS at MVP. It is a lightweight discovery and request marketplace.

## Core Object: Drop

A drop is a real last-minute activity, open spot, event opening, cancellation, discounted opportunity, or limited-time entertainment offer.

Examples:

- Comedy show seats available tonight.
- Dance class spots after a cancellation.
- Escape room slow-time deal.
- Karaoke room opening.
- Small workshop with remaining seats.
- Local tour opening.
- Family activity discount.
- Date-night experience deal.
- Last-minute ticket-style entertainment offer where no full ticketing integration is required.

Drops should not represent a provider's whole calendar, generic marketing page, or fake demo item.

## Customer

Customers:

- Discover last-minute fun, activity, event, or entertainment drops.
- Search and filter by category, date/time, distance, price, group type, and vibe.
- Switch between list and map views when location data is available.
- Save favorite drops.
- Submit booking/reservation requests.
- Track request status.
- Cancel when rules allow it.
- Leave reviews only after completed requests.
- Manage notification preferences and account settings.
- Delete or deactivate their account through a safe flow.

Customer browsing should work before login. Login is required when the customer saves, requests, reviews, or manages account data.

## Provider Or Host

Providers/hosts:

- Complete provider onboarding.
- Manage business, host, venue, or entertainment profile details.
- Store a location and image assets.
- Create drops with category, schedule, capacity, price/deal, image, and location snapshot.
- Manage draft, active, expired, cancelled, booked, and completed drops.
- Receive booking requests.
- Accept, decline, or mark requests completed when rules allow.
- See reviews and reliability signals.
- Manage subscription/plan limits if applicable.

Providers include venues, small event hosts, activity operators, instructors, entertainment providers, performers, DJs, nightlife hosts, local guides, and family activity businesses where appropriate.

## Admin

Admins:

- Manage users and account status.
- Review provider verification.
- Moderate drops, reports, and reviews.
- Manage suspicious listings and spam.
- Manage categories and demo/test data.
- View admin action logs.
- Bootstrap or remove admin access only through trusted owner/admin flow.

Admin functions can be web-first. Mobile admin screens should remain hidden unless explicitly approved.

## Drop Lifecycle

Recommended drop statuses:

- `draft`: provider is preparing the drop.
- `active`: visible and requestable if approved and not expired.
- `requested`: at least one pending request exists.
- `booked`: capacity or provider action has reserved the drop.
- `expired`: no longer valid because its time window passed.
- `cancelled`: provider/admin cancelled it.
- `completed`: experience happened and review flow can open.

Public discovery should show only active, approved, unexpired, requestable drops with available capacity.

## Booking Request Lifecycle

Recommended booking request statuses:

- `pending`: customer submitted request.
- `accepted`: provider accepted.
- `declined`: provider declined.
- `cancelled_by_customer`: customer cancelled while allowed.
- `cancelled_by_provider`: provider cancelled while allowed.
- `completed`: experience completed.
- `no_response`: provider did not respond within SLA.
- `expired`: request is no longer valid.

MVP uses request-to-confirm. Instant reserve can be added later only after reliability, capacity, notification, and abuse controls are ready.

## Trust Model

- Provider verification status should be visible when positive.
- Reviews should be tied to completed booking requests.
- Report issue flow should exist from request detail, drop detail, and review surfaces.
- Reliability scoring can be internal and should produce safe public labels only.
- Admin moderation status should not leak internal notes to customers.

## Categories

Initial category set:

- comedy shows
- live music
- dance classes
- escape rooms
- karaoke
- nightlife
- small events
- workshops
- local experiences
- sports activities
- tours
- party experiences
- social games
- hobby classes
- family activities
- date-night activities
- last-minute tickets
- entertainment providers
- performers / DJs / hosts when appropriate

Categories should remain editable in Firebase/admin rather than hardcoded permanently in FlutterFlow.

## MVP Boundaries

MVP includes lightweight request/reserve flow and provider/admin moderation. MVP does not include complex ticketing, payment escrow, refunds, full event organizer tools, multi-location enterprise controls, or complex chat.

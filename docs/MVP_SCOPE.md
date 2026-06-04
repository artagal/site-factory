# MVP Scope

Date: 2026-06-04

## MVP Goal

Launch a lightweight last-minute entertainment and activity marketplace where customers can find real local drops, save favorites, request spots, and providers can list/manage drops and respond to requests.

## Must Include

- Firebase Auth.
- Email/password sign-in and sign-up.
- Google sign-in.
- Apple sign-in.
- Role selection.
- Customer onboarding.
- Provider onboarding.
- Provider business/activity location.
- Provider image upload.
- Create drop.
- Discovery list/map.
- Category chips.
- Search.
- Filters.
- Favorite/saved drops.
- Drop detail.
- Request booking.
- Provider request inbox.
- Customer my requests.
- Accept/decline request.
- Reviews after completed requests.
- Customer and provider settings.
- Delete account.
- Push notification plan.
- Basic admin moderation plan.
- Dark/light mode polish.
- Builder-friendly FlutterFlow components.

## MVP Customer Flow

1. Customer opens app.
2. Customer browses Discovery without login.
3. Customer filters or searches for local activity drops.
4. Customer opens Drop Detail.
5. Customer signs in only when saving or requesting.
6. Customer submits request.
7. Customer tracks request in My Requests.
8. Customer reviews after completion.

## MVP Provider Flow

1. Provider selects provider/host role.
2. Provider completes onboarding and location.
3. Provider uploads profile image/cover.
4. Provider creates a drop.
5. Drop waits for approval or becomes active depending on moderation mode.
6. Provider receives request.
7. Provider accepts/declines.
8. Provider marks completed when allowed.

## MVP Admin Flow

1. Admin signs in with trusted account.
2. Admin opens protected admin pages.
3. Admin reviews users, drops, reviews, and reports.
4. Admin actions write audit records.

## Do Not Include Unless Easy And Explicitly Approved

- Full ticketing platform.
- Complex payments.
- Provider payouts.
- Escrow.
- Refund workflows.
- Full event organizer SaaS.
- Multi-location enterprise admin.
- Complex chat.
- AI itinerary generation beyond simple rule-based plan finding.
- Google Places, Ticketmaster, Eventbrite, or paid API integrations.
- Stripe checkout or direct payment flows.

## Acceptance Rules

- No raw placeholders in production-facing UI.
- All visible buttons work or are removed.
- All forms have validation.
- Customers can browse before login.
- Login is required for saves, requests, profile, provider dashboard, and admin.
- Provider-created drops cannot bypass moderation rules.
- Firestore rules block cross-user private data access.
- Dark and light mode are both readable.
- Mobile safe areas do not hide bottom controls.

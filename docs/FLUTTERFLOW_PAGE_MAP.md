# FlutterFlow Page Map

Date: 2026-06-04

## Builder-First Rule

All pages should be built with native FlutterFlow widgets, FlutterFlow components, Firebase queries, native actions, conditional visibility, page state, component state, and page parameters before custom code. Manual FlutterFlow Builder edits are the source of truth.

## Public And Auth Pages

### Intro Onboarding

Purpose: first-launch product explanation and primary CTA.

Key UI:

- Animated or static GoFunMotion brand splash/intro.
- Short value copy: find something fun to do today.
- Activity preview cards.
- `Get started` and `I already have an account`.

Navigation:

- `Get started` -> Auth Landing / Role Selection.
- `I already have an account` -> Sign In.

### Auth Landing / Role Selection

Purpose: choose customer or provider path.

Key UI:

- Customer option as primary CTA.
- Provider/Host option as secondary but clearly tappable.
- Sign-in row.
- Trust badges such as Request first, Local deals, Verified hosts.

Navigation:

- Customer -> Customer Sign Up / Onboarding.
- Provider -> Provider Sign Up / Onboarding.
- Sign in -> Sign In.

### Sign In

Purpose: existing user sign-in.

Auth providers:

- Email/password.
- Google.
- Apple.

Navigation:

- Customer role -> Discovery.
- Provider role -> Provider Dashboard.
- Admin role/admin doc -> Admin Users or Admin Dashboard.

### Customer Sign Up / Onboarding

Purpose: create customer profile and preferences.

Fields:

- Name.
- Email/password or social auth.
- Phone optional.
- City.
- Preferred categories.
- Notification opt-in.

Writes:

- `users/{uid}`.
- `customer_profiles/{uid}`.

### Provider Sign Up / Onboarding

Purpose: create provider/host account and profile.

Fields:

- Business or host name.
- Description.
- Phone.
- City/address.
- Activity categories.
- Website/social links.
- Avatar/cover image.

Writes:

- `users/{uid}`.
- `provider_profiles/{uid}`.
- Optional first `reports`/admin review trigger through moderation status.

### Forgot Password

Purpose: Firebase Auth password reset.

Use FlutterFlow/Firebase native password reset if available.

## Customer Pages

### Discovery

Purpose: main browsing page.

Key UI:

- City/search field.
- Category chips.
- Date/time filters.
- Deal/activity cards.
- Saved heart.
- Sticky mobile search/filter action.
- Empty/loading/error states.

Query:

- `drops` where `moderationStatus == approved`, `status == active`, city/category/time filters.

### Map/List View

Purpose: location-forward discovery.

Key UI:

- Map/list segmented control.
- Search this area.
- Filter bottom sheet.
- Drop cards tied to same filters as map pins.

Custom code:

- Only map marker behavior if native FlutterFlow map cannot meet requirements.
- Keep filters and list cards Builder-native when possible.

### Filters

Purpose: narrow discovery.

State:

- Page state for category, day/time, price, distance, group type, and vibe.

Actions:

- Apply filters.
- Reset filters.

### Drop Detail

Purpose: show selected drop.

Page parameter:

- `dropId`.

Key UI:

- Hero image.
- Title.
- Provider/host.
- Date/time.
- Location.
- Price/deal badge.
- Capacity/spots.
- Activity details.
- Trust/reviews.
- Save heart.
- Request/reserve CTA.
- Report issue link.

Query:

- Direct `drops/{dropId}` or filtered query by id.

### Booking Request

Purpose: submit request-to-confirm.

Page parameters:

- `dropId`.
- Optional `providerId`.

Key UI:

- Selected drop summary.
- Customer name, phone, email.
- Party size.
- Message.
- Validation.
- Request CTA.
- Copy that no payment is collected at MVP.

Writes:

- `booking_requests/{requestId}` through safe Firestore write or Cloud Function.

### My Requests

Purpose: customer request history.

Query:

- `booking_requests` where `customerId == currentUser.uid`, ordered by `createdAt desc`.

Key UI:

- Status tabs/chips.
- Request cards.
- Empty state.

### Request Detail

Purpose: status and next steps.

Page parameter:

- `requestId`.

Key UI:

- Drop summary.
- Status timeline.
- Provider response.
- Accepted-state contact/next steps.
- Cancel button if allowed.
- Review CTA when completed.
- Report issue.

### Saved Drops

Purpose: favorites list.

Query:

- `favorites` where `userId == currentUser.uid`, then referenced drops.

Key UI:

- Saved drop cards.
- Remove saved.
- Empty state leading back to Discovery.

### Booking Review

Purpose: review completed request.

Page parameter:

- `bookingRequestId`.

Key UI:

- Star rating.
- Review tags.
- Would book again.
- Text input.
- Submit.

Writes:

- `reviews/{bookingRequestId}` or deterministic id.

### Customer Settings

Purpose: account, support, legal, notifications, delete account.

Actions:

- Edit profile.
- Notification preferences.
- Support.
- Terms.
- Privacy.
- Sign out.
- Delete account.

### Edit Profile

Purpose: edit customer profile and photo.

Writes:

- `users/{uid}` safe fields.
- `customer_profiles/{uid}` preferences.

## Provider Pages

### Provider Dashboard

Purpose: provider command center.

Key UI:

- Active drops count.
- Pending requests count.
- Plan usage.
- Create drop CTA.
- Recent requests.
- Drop performance summary.

Queries:

- `drops` where `providerId == currentUser.uid`.
- `booking_requests` where `providerId == currentUser.uid`.
- `subscriptions/{uid}`.

### Create Drop

Purpose: create or edit activity drop.

Fields:

- Title.
- Category/activity type.
- Deal type.
- Description.
- Schedule.
- Capacity.
- Regular/deal price.
- Image upload.
- Location snapshot from provider profile.
- Confirmation mode.

Writes:

- `drops/{dropId}`.

### Manage Drops

Purpose: provider drop list.

Query:

- `drops` where `providerId == currentUser.uid`, filter by status.

Actions:

- Edit draft.
- Cancel.
- Repost/duplicate later.
- View requests.

### Request Inbox

Purpose: provider request queue.

Query:

- `booking_requests` where `providerId == currentUser.uid`, status filters.

Actions:

- Accept.
- Decline.
- Open request detail.

### Provider Request Detail

Purpose: provider response workflow.

Page parameter:

- `requestId`.

Actions:

- Accept.
- Decline.
- Mark completed when allowed.
- Report issue.

### Provider Settings

Purpose: provider account and business settings.

Navigation:

- Edit Provider Profile.
- Subscription / Plan.
- Reviews.
- Support.
- Terms/Privacy.
- Delete account.

### Edit Provider Profile

Purpose: manage public provider profile.

Fields:

- Business/host name.
- Description.
- Phone.
- Website/social links.
- Address/location.
- Images.

### Subscription / Plan

Purpose: show plan, limits, and upgrade intent.

MVP:

- Show current plan and limits.
- Do not add payment checkout until billing provider is approved.

### Reviews

Purpose: provider reviews view.

Query:

- `reviews` where `providerId == currentUser.uid`.

## Admin Pages

Admin pages must be protected by `admin_users/{uid}` or custom claims.

### Admin Users

- Search users.
- Filter role/status.
- Suspend/reactivate.
- Soft-delete/anonymize non-admin users.

### Admin Reviews

- Review pending reviews.
- Approve/hide/reject.

### Admin Reports

- Review user reports.
- Update status.
- Link to target record.

### Admin Drops

- Review pending/suspicious drops.
- Approve/reject/flag/cancel.

### Admin Actions Log

- Read-only audit history.

## Shared Pages

- Support.
- Terms.
- Privacy.
- Delete Account.

## Route Guard Summary

- Public: intro, auth, sign in, forgot password, discovery, drop detail read-only.
- Customer: saves, booking request, my requests, request detail, review, settings.
- Provider: dashboard, create/manage drops, inbox, provider profile, plan.
- Admin: moderation and user management only.

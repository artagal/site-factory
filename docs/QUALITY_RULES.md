# Quality Rules

Date: 2026-06-04

## Product Quality Rules

- No raw placeholders in production-facing UI.
- No fake marketplace data shown as real providers or real drops.
- Demo data must be seeded test data with real Firebase ids and clear demo status.
- Customers can browse before login.
- Login is required for saves, booking requests, profile, provider dashboard, reviews, and admin.
- Booking/request copy must match the actual MVP behavior.
- Do not mention payment collection until payment is implemented.
- Do not show internal admin or technical text to normal users.

## FlutterFlow Rules

- Builder-first always.
- Use native FlutterFlow widgets first.
- Use FlutterFlow components for repeated UI.
- Use Firebase queries for backend data.
- Use native actions where possible.
- Use conditional visibility for simple state.
- Use page state and component state for local UI.
- Use page parameters for detail pages.
- Use App State only for truly global facts.
- Use custom functions only for simple pure utilities.
- Use custom actions only when FlutterFlow cannot safely do it.
- Use custom widgets only as a last resort.

## UI Rules

- Light and dark mode must both be readable.
- No text overlap.
- No bottom safe-area overlap.
- Buttons must fit on small mobile screens.
- Sticky search/filter controls must not hide content.
- Empty states must include a next action.
- Loading states must not be blank.
- Error states must be user-readable and include retry where useful.
- Cards should be compact, scannable, and consistent.
- Admin and provider tables must work on mobile or use a responsive list layout.

## Form Rules

- All required fields validate.
- Email fields validate email shape.
- Phone fields validate enough for contact use.
- Price fields prevent invalid negative values.
- Deal price should not exceed regular price.
- Capacity must be at least 1.
- Start time must be before end time.
- Publishing should be blocked when required provider location is missing.
- Submits show success, loading, and error states.

## Firebase Rules

- No public write access to protected collections.
- Users cannot edit another user's private data.
- Providers cannot edit another provider's drops or requests.
- Providers cannot self-approve drops.
- Customers cannot create booking requests for another user.
- Reviews require completed booking requests.
- Admin moderation requires admin authorization.
- Device tokens are user-owned.
- Account deletion is trusted and safe.

## Data Rules

- Public discovery shows only approved, active, unexpired, requestable drops.
- Expired drops disappear from public discovery.
- Saved drops are user-owned.
- Booking requests keep immutable participant ids.
- Location snapshots are copied into drops at publish time.
- Admin action logs are append-only.
- Reliability raw scores stay internal.

## QA Rules

Before launch candidate:

- Test email/password auth.
- Test Google auth.
- Test Apple auth on device/TestFlight.
- Test role routing.
- Test customer onboarding.
- Test provider onboarding.
- Test create drop.
- Test discovery filters and search.
- Test map/list view.
- Test save/remove favorite.
- Test booking request.
- Test provider accept/decline.
- Test customer request detail.
- Test completed review.
- Test delete account.
- Test dark mode.
- Test light mode.
- Test small mobile viewport.
- Test protected redirects.
- Test Firestore rules with emulator or dry-run equivalent.

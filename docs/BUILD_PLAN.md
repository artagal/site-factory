# Build Plan

Date: 2026-06-04

## Rule For This Pass

This pass creates the planning foundation only. Do not start building all screens, rules, functions, or FlutterFlow changes until the plan is approved.

## Sprint 1: Firebase Setup, Auth, Roles, And Builder Foundation

Goals:

- Confirm Firebase project.
- Configure Firebase Auth providers: email/password, Google, Apple.
- Define Firestore collections.
- Draft and dry-run Firestore rules/indexes.
- Build role selection and onboarding flow plan.
- Define Builder-friendly shared components.
- Ensure page map aligns with Firebase query patterns.

Deliverables:

- Firebase data model docs.
- Security rules plan.
- FlutterFlow page map.
- Shared components plan.
- Auth/role flow plan.
- First Firestore rules/index draft after approval.

Stop condition:

- Stop before implementation until user approves the first build sprint.

## Sprint 2: Provider Onboarding And Create Drop

Goals:

- Provider onboarding.
- Provider profile/location setup.
- Provider image upload.
- Create Drop form.
- Location snapshot.
- Plan-limit warning.

Deliverables:

- Provider profile pages.
- Create Drop page.
- Manage Drops basic list.
- Storage upload paths.

## Sprint 3: Customer Discovery

Goals:

- Discovery list.
- Map/list view.
- Category chips.
- Search.
- Filters.
- Drop Detail.

Deliverables:

- Approved-only drop queries.
- Empty/loading/error states.
- Save heart UI gated by auth.
- Drop Detail with request CTA.

## Sprint 4: Request Flow

Goals:

- Booking Request page.
- Customer My Requests.
- Request Detail.
- Provider Request Inbox.
- Accept/decline transitions.

Deliverables:

- Firestore or Cloud Function request writes.
- Provider inbox status filters.
- Customer status timeline.
- Basic push notification events if FCM is ready.

## Sprint 5: Favorites, Reviews, Settings, Delete Account

Goals:

- Saved Drops.
- Completed-booking review flow.
- Customer/provider settings.
- Delete account.
- Support/legal links.

Deliverables:

- User-owned favorites queries.
- Reviews collection and moderation status.
- Safe delete-account function/plan.

## Sprint 6: Admin, Subscriptions, Push, QA, Polish

Goals:

- Admin users.
- Admin drops.
- Admin reviews.
- Admin reports.
- Admin actions log.
- Subscription limit display.
- Push notification QA.
- Full dark/light QA.

Deliverables:

- Protected admin pages.
- Plan usage dashboard.
- FCM token registration.
- QA checklist completion.

## Approval Needed Before Build

Before implementation, confirm:

- Firebase project ID and whether web/mobile share it.
- Final collection names: `drops`/`booking_requests` versus existing web `listings`/`bookingRequests` compatibility.
- Whether admin is web-only for MVP.
- Whether provider-created drops require approval before all public visibility.
- Whether booking request creation should be direct Firestore write or Cloud Function.
- Whether subscriptions are display-only at MVP or tied to a billing provider later.

# Firebase Implementation Plan

Date: 2026-06-04

## Scope

This plan translates the marketplace patterns into Firebase and FlutterFlow. It does not implement payment checkout, paid external APIs, or a full ticketing backend.

## Firebase Project Setup

Required Firebase products:

- Firebase Auth.
- Firestore.
- Firebase Storage.
- Firebase Cloud Messaging.
- Firebase Security Rules.
- Firebase Functions if trusted server logic is needed.

FlutterFlow should connect to the same Firebase project selected for the GoFunMotion app unless a separate staging project is explicitly approved.

## Auth Providers

Enable:

- Email/password.
- Google.
- Apple.

Recommended checks:

- Confirm OAuth redirect domains.
- Confirm iOS bundle ID and Android package in Firebase apps.
- Confirm Apple Sign In entitlement for iOS builds.
- Confirm Google reversed client ID for iOS when needed.
- Verify sign-in creates or loads `users/{uid}`.

## Firestore Collections

Primary target collections:

- `users`
- `customer_profiles`
- `provider_profiles`
- `drops`
- `booking_requests`
- `favorites`
- `reviews`
- `reports`
- `admin_actions`
- `device_tokens`
- `subscriptions`

Optional/admin support:

- `admin_users`
- `categories`
- `cities`
- `notification_events`
- `provider_reliability_stats`

Use `docs/FIREBASE_DATA_MODEL.md` as the field source of truth.

## Firebase Storage

Recommended storage areas:

- `provider-media`
- `drop-media`
- `review-media` optional

Path examples:

```text
provider-media/{providerId}/avatar/{fileName}
provider-media/{providerId}/cover/{fileName}
drop-media/{providerId}/{dropId}/{fileName}
review-media/{userId}/{reviewId}/{fileName}
```

Rules:

- Provider media writes limited to owner.
- Drop media writes limited to provider owner.
- Review media writes limited to review owner if enabled.
- Restrict content types and file sizes.

## Firestore Indexes

Initial indexes:

- Public discovery by city/time: `drops(moderationStatus, status, city, startAt)`.
- Public discovery by category/time: `drops(moderationStatus, status, category, startAt)`.
- Provider manage drops: `drops(providerId, status, updatedAt desc)`.
- Customer requests: `booking_requests(customerId, createdAt desc)`.
- Provider inbox: `booking_requests(providerId, status, createdAt desc)`.
- Favorites: `favorites(userId, createdAt desc)`.
- Favorite idempotency lookup: `favorites(userId, dropId)`.
- Provider approved reviews: `reviews(providerId, moderationStatus, createdAt desc)`.
- Admin reports queue: `reports(status, createdAt)`.
- Admin audit log by target: `admin_actions(targetType, targetId, createdAt desc)`.

Create indexes in `firestore.indexes.json` after confirming final collection names.

## Security Rules

Use `docs/FIREBASE_SECURITY_RULES_PLAN.md` as the rules contract.

Critical requirements:

- No public writes to protected collections.
- Users can read/update only their own private profile data.
- Customers can create requests only as themselves.
- Providers can manage only their own drops.
- Providers can read only requests for their drops.
- Users manage only their own favorites.
- Reviews require completed requests.
- Admin moderation requires `admin_users/{uid}` or trusted claims.
- Account deletion uses a trusted endpoint/function.

## Cloud Functions Candidates

Use Cloud Functions where Firestore rules or FlutterFlow actions cannot safely enforce business logic:

- `createBookingRequest`: validates active approved drop, capacity, duplicate requests, and writes notifications.
- `acceptBookingRequest`: validates provider ownership, updates request, updates drop capacity/status, sends push.
- `declineBookingRequest`: validates provider ownership and sends push.
- `completeBookingRequest`: validates status and enables review.
- `expireDropsAndRequests`: scheduled expiry.
- `enforceProviderDropLimit`: plan/day active drop limits.
- `submitReview`: validates completed request and one-review-per-request.
- `deleteAccount`: soft-delete/anonymize and deactivate tokens.
- `sendPushNotification`: server-side FCM.
- `adminModerateDrop`: approve/reject/flag and log admin action.

Start with direct Firestore writes only when rules can safely validate the write.

## FCM Push Notifications

Device token flow:

1. User signs in.
2. App asks notification permission.
3. FlutterFlow gets FCM token.
4. App writes/updates `device_tokens`.
5. Token refresh updates the same record or creates a new token record.
6. Trusted function sends notifications on booking events.

Events:

- Customer creates request -> provider receives push.
- Provider accepts request -> customer receives push.
- Provider declines request -> customer receives push.
- Customer cancels pending request -> provider receives push.
- Reminder/expiry notifications can come later.

Server FCM credentials must stay outside FlutterFlow/client code.

## BeautyDrop Supabase Translation

| Supabase Pattern | Firebase Pattern |
| --- | --- |
| RLS policies | Firestore and Storage Security Rules |
| RPC for trusted writes | Cloud Functions or tightly validated Firestore writes |
| `auth.uid()` | `request.auth.uid` |
| Supabase Storage | Firebase Storage |
| Supabase Realtime | Firestore realtime listeners |
| Supabase service role | Firebase Admin SDK in Cloud Functions/server only |
| Supabase profile role | `users/{uid}.role` plus `admin_users/{uid}` for admin |

## FlutterFlow Implementation Order

1. Connect Firebase project.
2. Import/define Firestore collections.
3. Configure Auth providers.
4. Build role onboarding with native Firebase Auth.
5. Build customer/provider profile writes.
6. Build drops list queries with approved-only filters.
7. Build provider create-drop form.
8. Build booking request flow.
9. Build provider inbox.
10. Build saved drops.
11. Build reviews.
12. Add FCM token registration.
13. Add admin moderation screens after admin access is safe.

Do not wire public discovery to unapproved provider-created drops.

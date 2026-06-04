# Firebase Security Rules Plan

Date: 2026-06-04

## Goals

Security rules must protect private user data, prevent public writes, enforce ownership, keep provider listings under moderation control, and allow the FlutterFlow app to use Firebase-native queries safely.

Rules should be designed before building FlutterFlow screens so the Builder queries match the allowed access patterns.

## Roles

Recommended role helpers:

- Signed-in user: `request.auth != null`
- Own user record: `request.auth.uid == uid`
- Provider owner: `request.auth.uid == providerId`
- Admin: `exists(/databases/$(database)/documents/admin_users/$(request.auth.uid))` or equivalent custom claim

Do not rely only on a client-editable `users/{uid}.role == admin` field for sensitive writes.

## users/{uid}

Rules:

- Users can read their own user document.
- Users can update safe own fields such as display name, phone, photo URL, and notification choices.
- Users cannot set their own role to admin.
- Users cannot reactivate, unsuspend, or undelete themselves by editing `accountStatus`.
- Admins can read and manage user account status through trusted admin paths.

## customer_profiles/{uid}

Rules:

- Users can create/read/update their own customer profile.
- Users cannot read another customer's private preferences.
- Admins can read profiles for moderation/support.

## provider_profiles/{uid}

Rules:

- Providers can create/read/update their own profile fields.
- Public users can read approved public provider fields only if the provider is active/verified enough for public display.
- Providers cannot self-verify, self-approve, or edit reliability/admin fields.
- Admins can update verification status, moderation fields, and trust/safety fields.

## drops/{dropId}

Rules:

- Public read should allow only approved, active, unexpired drops.
- Providers can create draft or pending-review drops where `providerId == request.auth.uid`.
- Providers can update their own draft/pending drops and non-admin editable fields.
- Providers cannot set `moderationStatus` to `approved`.
- Providers cannot edit another provider's drops.
- Admins can approve, reject, flag, suspend, or cancel drops.
- Deletes should be admin-only or soft-delete/status updates for providers.

Validation:

- Required fields must exist for active/pending drops.
- `dealPrice <= regularPrice` when both prices exist.
- `capacity >= 1`.
- `spotsRemaining >= 0` and `spotsRemaining <= capacity`.
- `startAt < endAt`.
- `expiresAt >= startAt` or another explicit expiry policy.

## booking_requests/{requestId}

Rules:

- Customers can create requests only for themselves with `customerId == request.auth.uid`.
- Customers can create requests only for active approved drops. If rules cannot safely verify all fields, use a Cloud Function.
- Customers can read their own requests.
- Providers can read requests where `providerId == request.auth.uid`.
- Providers can accept/decline only requests for their own drops.
- Customers can cancel only their own pending requests.
- Completion, no-response, and expiry transitions should be trusted Cloud Functions or tightly controlled admin/provider actions.
- Users cannot edit another user's contact information.

## favorites/{favoriteId}

Rules:

- Users can create/read/delete favorites where `userId == request.auth.uid`.
- Users cannot create favorites for another user.
- Users cannot edit `userId` after creation.
- Favorite docs should reference a valid drop id.

## reviews/{reviewId}

Rules:

- Customers can create one review after a completed booking request they own.
- Reviews should start with `moderationStatus == pending`.
- Customers can edit only their own review text/tags before admin approval if product policy allows.
- Providers can read reviews tied to their provider id.
- Public can read approved reviews only.
- Admins can approve, hide, reject, or restore reviews.

If one-review-per-request cannot be enforced cleanly in rules, use deterministic ids:

```text
reviews/{bookingRequestId}
```

## reports/{reportId}

Rules:

- Signed-in users can create reports with `reporterId == request.auth.uid`.
- Users can read their own reports if needed.
- Target users/providers should not read reports by default.
- Admins can read and update report status.

## admin_actions/{actionId}

Rules:

- Admins can create and read admin action logs.
- Normal users cannot read or write admin action logs.
- Update/delete should be blocked to keep an audit trail, unless a trusted maintenance function is approved.

## device_tokens/{tokenId}

Rules:

- Users can create/update/deactivate their own device tokens.
- Users cannot read or write another user's tokens.
- Admins should avoid direct token browsing unless necessary for support.
- Server-side FCM sending uses service credentials outside client code.

## subscriptions/{userId}

Rules:

- Users can read their own subscription entitlement.
- Providers cannot self-upgrade by writing subscription docs.
- Only admins or trusted billing functions can update plan/status/entitlement.
- Public users cannot read subscription docs.

## Firebase Storage

Recommended paths:

- `provider-media/{providerId}/...`
- `drop-media/{providerId}/{dropId}/...`
- `review-media/{userId}/{reviewId}/...` optional

Rules:

- Users can upload to their own allowed path.
- Providers can upload provider/drop media for their own provider id.
- File type and max size should be restricted.
- Public reads should be allowed only for approved public media if using protected paths. Otherwise keep media URLs public but moderation-gated by Firestore documents.
- Admins can remove abusive media.

## Cloud Functions Needed When Rules Are Not Enough

Use Cloud Functions for:

- Atomic booking request creation with capacity checks.
- Accept/decline transitions with notification fanout.
- Completion/no-response expiry transitions.
- Enforcing provider daily active drop limits.
- Calculating reliability score.
- Account deletion/anonymization.
- Admin moderation actions that require audit log writes.
- FCM push sending.

## Account Deletion

The client should call a trusted delete-account endpoint/function. The flow should:

- Verify the signed-in Firebase Auth user.
- Soft-delete/anonymize `users/{uid}`.
- Delete or anonymize customer/provider profile personal fields.
- Cancel active/pending marketplace activity where policy requires.
- Deactivate device tokens.
- Preserve minimal audit records.
- Sign the user out.

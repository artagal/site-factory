# Auth Role Flow Plan

Date: 2026-06-04

## Purpose

GoFunMotion needs a reliable Firebase Auth and role-routing flow for customers, providers/hosts, and admins. The flow should be Builder-friendly and avoid hidden custom logic unless Firebase/FlutterFlow cannot safely handle the operation.

## Auth Providers

Required providers:

- Email/password.
- Google.
- Apple.

Provider setup is outside source control and must be confirmed in Firebase Console and Apple/Google developer settings.

## Role Source Of Truth

Primary role source:

```text
users/{uid}.role
```

Allowed roles:

- `customer`
- `provider`
- `admin`

Admin-sensitive authorization should also require:

```text
admin_users/{uid}
```

or Firebase custom claims. Do not rely only on a user-editable profile role for admin writes.

## New Customer Flow

1. User taps Customer on Role Selection.
2. User signs up with email, Google, or Apple.
3. App creates/updates `users/{uid}`:
   - `role = customer`
   - `onboardingComplete = false`
   - `accountStatus = active`
4. App writes `customer_profiles/{uid}`.
5. User completes preferences.
6. App sets `users/{uid}.onboardingComplete = true`.
7. Navigate to Discovery.

## New Provider Flow

1. User taps Provider/Host on Role Selection.
2. User signs up with email, Google, or Apple.
3. App creates/updates `users/{uid}`:
   - `role = provider`
   - `onboardingComplete = false`
   - `accountStatus = active`
4. App writes `provider_profiles/{uid}` with `verificationStatus = pending` or `unverified`.
5. User completes business/host details, location, categories, and images.
6. App sets `users/{uid}.onboardingComplete = true`.
7. Navigate to Provider Dashboard.

## Existing User Sign-In Flow

1. User signs in.
2. App queries `users/{uid}`.
3. If missing:
   - send to Role Selection or recovery onboarding.
4. If `accountStatus == suspended`:
   - show account status/support screen.
5. If `accountStatus == deleted`:
   - block access and show support/account recovery guidance.
6. If admin doc/claim exists:
   - show admin entry or route to admin when requested.
7. If `role == provider`:
   - if onboarding incomplete, route to Provider Onboarding.
   - else route to Provider Dashboard.
8. If `role == customer`:
   - if onboarding incomplete, route to Customer Onboarding.
   - else route to Discovery.

## Builder-Native Routing Pattern

Preferred FlutterFlow action chain:

1. Auth action completes.
2. Backend query `users/{currentUser.uid}`.
3. Conditional action branches:
   - no user doc -> Auth Landing / Role Selection
   - suspended/deleted -> Account Status
   - provider + incomplete -> Provider Onboarding
   - provider + complete -> Provider Dashboard
   - customer + incomplete -> Customer Onboarding
   - customer + complete -> Discovery
   - admin doc exists -> show Admin tab/entry

If this conditional tree fails FlutterFlow validation or becomes unmaintainable, propose a small custom action before implementing it.

## Pending OAuth Role

Social auth can return after a provider selection. Avoid losing the intended role.

Builder-friendly options:

- Store selected role in page state before starting social auth.
- Pass role through onboarding page flow after auth.
- If FlutterFlow loses page state during OAuth, use a minimal `pendingRole` App State value and clear it after profile creation.

Do not keep long-lived role intent in App State after onboarding completes.

## Protected Redirects

Customer-only pages:

- Saved Drops.
- Booking Request.
- My Requests.
- Booking Review.
- Customer Settings.

Provider-only pages:

- Provider Dashboard.
- Create Drop.
- Manage Drops.
- Request Inbox.
- Provider Settings.

Admin-only pages:

- Admin Users.
- Admin Drops.
- Admin Reviews.
- Admin Reports.
- Admin Actions Log.

Public pages:

- Intro.
- Auth Landing.
- Sign In.
- Forgot Password.
- Discovery.
- Drop Detail read-only.

## Delete Account Flow

1. User opens Delete Account.
2. App shows confirmation dialog.
3. App calls trusted delete-account function/endpoint.
4. Function anonymizes/soft-deletes records and deactivates device tokens.
5. App signs out.
6. App navigates to Intro or Auth Landing.

Do not hard-delete sensitive user state directly from client code.

## QA Checklist

- Email customer signup routes to Discovery after onboarding.
- Google customer signup routes to Discovery after onboarding.
- Apple customer signup routes to Discovery after onboarding.
- Email provider signup routes to Provider Dashboard after onboarding.
- Google provider signup routes to Provider Dashboard after onboarding.
- Apple provider signup routes to Provider Dashboard after onboarding.
- Existing customer sign-in routes correctly.
- Existing provider sign-in routes correctly.
- Suspended user cannot access app pages.
- Admin entry is hidden from non-admins.
- Sign-out clears pending role state.
- Favorite tap while signed in never shows a false signed-out prompt.
- Protected pages redirect signed-out users to Sign In.

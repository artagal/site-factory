# GoFunMotion Firebase Live Setup

This repo is Firebase-ready for GoFunMotion Deals. Real cloud sync requires a Firebase project, enabled auth providers, Firestore, deployed rules/indexes, and matching Vercel environment variables.

## Local CLI

Use the repo-local Firebase CLI:

```powershell
npm.cmd run firebase:login
npm.cmd run firebase:login:list
```

If the Codex shell is non-interactive, run the same command in a normal Windows terminal.

## Create Firebase Project

Recommended project naming:

```powershell
npm.cmd exec -- firebase projects:create gofunmotion-prod --display-name "GoFunMotion"
```

If that project ID is taken, use a unique suffix:

```powershell
npm.cmd exec -- firebase projects:create gofunmotion-prod-001 --display-name "GoFunMotion"
```

Then create `.firebaserc` from `.firebaserc.example`:

```json
{
  "projects": {
    "default": "YOUR_FIREBASE_PROJECT_ID"
  }
}
```

## Create Web App

```powershell
npm.cmd exec -- firebase apps:create WEB "GoFunMotion Web" --project YOUR_FIREBASE_PROJECT_ID
npm.cmd exec -- firebase apps:list --project YOUR_FIREBASE_PROJECT_ID
npm.cmd exec -- firebase apps:sdkconfig WEB YOUR_FIREBASE_APP_ID --project YOUR_FIREBASE_PROJECT_ID
```

Copy the SDK config values into `apps/website/.env.local`.

Required client variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_SITE_URL=
```

Do not commit `.env.local`.

## Enable Auth Providers

In Firebase Console:

1. Open Authentication.
2. Click Get started.
3. Enable Anonymous.
4. Enable Google.
5. Enable Apple.
6. Enable Email/password.
7. Add the production domain to authorized domains:
   - `gofunmotion.com`
   - the active Vercel deployment domain

## Create Firestore

In Firebase Console:

1. Open Firestore Database.
2. Create database.
3. Start in production mode.
4. Pick the closest region to the primary audience.

Deploy the repo rules and indexes:

```powershell
npm.cmd run firebase:deploy:firestore
```

This deploys `firestore.rules` and `firestore.indexes.json`.

## Deals Collections

The web prototype still uses the first-pass collections below and remains compatible with them:

```text
cities/{cityId}
categories/{categoryId}
businesses/{businessId}
listings/{listingId}
bookingRequests/{requestId}
partnerApplications/{applicationId}
savedListings/{savedListingId}
savedPlans/{savedPlanId}
plans/{planId}
users/{userId}
users/{userId}/savedListings/{listingId}
users/{userId}/savedPlans/{planId}
waitlist/{entryId}
analyticsEvents/{eventId}
globalStats/main
admins/{userId}
```

Public listing reads require `status == "published"` and `approvalStatus == "approved"`. Partner-created listings should remain pending until an admin approves them.

The approved FlutterFlow/Firebase app model adds these canonical collections for the next mobile implementation pass:

```text
admin_users/{userId}
customer_profiles/{userId}
provider_profiles/{userId}
drops/{dropId}
booking_requests/{requestId}
favorites/{favoriteId}
reviews/{reviewId}
reports/{reportId}
admin_actions/{actionId}
device_tokens/{tokenId}
subscriptions/{userId}
```

Public drop reads require `status == "active"`, `moderationStatus == "approved"`, a non-expired `expiresAt` when present, and available spots when `spotsRemaining` is present. Provider-created drops must stay `draft` or `pending_review` until admin approval.

## Firebase Admin on Vercel

Production server routes need Firebase Admin credentials for trusted backend writes:

```text
/api/booking-request
/api/partner-application
/api/waitlist
/api/track
/api/account/delete
/api/admin/categories
/api/admin/cities
/api/admin/listings/moderate
/api/admin/partner-applications/approve
/api/admin/users/lookup
/api/partner/listings
/api/partner/booking-requests/status
```

Create a Firebase service account in Firebase Console:

1. Project settings.
2. Service accounts.
3. Generate new private key.
4. Base64-encode the JSON file locally.
5. Add the encoded value to Vercel as `FIREBASE_SERVICE_ACCOUNT_JSON`.

PowerShell base64 helper:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\service-account.json"))
```

Do not expose this value in client code. Do not commit it. After adding the Vercel env var, redeploy production.

If Admin credentials are missing:

- Public browsing still works.
- Rule-based plan finding still works with local/demo data.
- Firebase client auth can still initialize.
- Trusted writes return safe fallback responses instead of crashing.

## Vercel Environment Variables

Use the Vercel dashboard or CLI:

```powershell
npx.cmd vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
npx.cmd vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
npx.cmd vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
npx.cmd vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
npx.cmd vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
npx.cmd vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
npx.cmd vercel env add NEXT_PUBLIC_SITE_URL production
npx.cmd vercel env add FIREBASE_SERVICE_ACCOUNT_JSON production
```

Repeat for `preview` if needed.

Do not configure Stripe, consumer checkout, partner checkout, Stripe Connect, or payment webhook environment variables yet. Booking stays request-based until fulfillment, refund, confirmation, tax, and support policies are ready.

## Verification Checklist

1. Run locally:

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

2. Start local dev on an open port:

```powershell
npm.cmd run dev -- --port 3004 --hostname 127.0.0.1
```

3. Verify:
   - `/` shows `Find something fun to do today.`
   - `/find` can generate a plan without login.
   - `/deals` shows approved/demo deals.
   - `/login` offers Google, Apple, and email options.
   - `/pricing` says checkout is not active.
   - `/api/checkout/partner-subscription` returns `404`.
   - A signed-in user can save a plan or deal.
   - A signed-in user can create a booking request.
   - `/profile/settings` redirects unauthenticated users to `/profile` and exposes account actions after login.
   - Partner listing creation keeps listings pending admin approval.
   - Admin moderation can approve or reject pending listings.

## Notes

Global stats and analytics writes are blocked from the public client by Firestore rules. They are routed through trusted Vercel API routes when `FIREBASE_SERVICE_ACCOUNT_JSON` is configured. A future Cloud Function can replace these server routes if the backend moves fully into Firebase.

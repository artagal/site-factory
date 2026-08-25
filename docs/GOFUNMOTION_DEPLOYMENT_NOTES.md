# GoFunMotion Deployment Notes

This repository now serves GoFunMotion as the primary website for `gofunmotion.com`.

For the production launch checklist, environment audit, smoke-test script, and rollback runbook, use `docs/GOFUNMOTION_PRODUCTION_RELEASE_CHECKLIST.md`.

## Vercel

- Framework: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Root directory: `apps/website`
- Output directory: `.next`
- Domain: `gofunmotion.com`

## Firebase

Firebase is optional for browsing demo deals, but live auth, saves, booking requests, partner dashboards, and admin approvals require Firebase.

When ready, configure these Vercel environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON`

Firestore rules and indexes are defined in:

- `firestore.rules`
- `firestore.indexes.json`

Current validation status:

```powershell
.\node_modules\.bin\firebase.cmd deploy --only firestore:rules,firestore:indexes --dry-run
```

This dry run compiled `firestore.rules` successfully against `gofunmotion-prod` on 2026-06-01. It did not deploy changes.

Deploy only after confirming the Firebase project and release window:

```powershell
npm.cmd run firebase:deploy:firestore
```

The rules support the richer web schema, the FlutterFlow first-pass schema, and the approved FlutterFlow-native Firebase schema. Web compatibility collections remain `businesses`, `listings`, `bookingRequests`, `savedListings`, and `savedPlans`. The approved mobile app collections are `customer_profiles`, `provider_profiles`, `drops`, `booking_requests`, `favorites`, `reviews`, `reports`, `admin_actions`, `device_tokens`, `subscriptions`, and `admin_users`.

Public listing reads are still restricted to approved/published records. Public drop reads are restricted to active, approved, unexpired, available drops. FlutterFlow list queries must use approved-only and user-owned filters before production live data is used.

FlutterFlow commit `Fo0wIyFfekjgrjknaTlF` temporarily disables broad public/user list reads on `DiscoverPage`, `DealsPage`, and `SavedPage`. Re-enable those list widgets only with approved-only and user-owned Builder query filters.

FlutterFlow commit `0LmSN7gNC3FeveuF3USY` adds the brand app icon, static splash path, and animated `SplashPage` using `assets/brand/gofunmotion-splash-motion.gif`. Visually QA the GIF timing on target devices before release.

## Brand Assets

Generated brand assets are listed in `docs/GOFUNMOTION_BRAND_ASSETS.md`.

Website integration includes:

- Favicon and Apple touch icon.
- PWA manifest route at `/manifest.webmanifest`.
- PWA icons at `/icon-192.png`, `/icon-512.png`, and `/maskable-icon-512.png`.
- Brand mark in the navbar.
- OG image at `/og/gofunmotion-og.png`.
- Static splash at `/brand/gofunmotion-splash.png`.
- Animated splash GIF at `/brand/gofunmotion-splash-motion.gif`.

## Planner

`/api/plan` uses local rules and approved listing data. Do not add OpenAI, Gemini, Places, Ticketmaster, Eventbrite, or other paid APIs until the core deal marketplace is validated.

## Payments

Payments are intentionally not implemented in this validation build.

Stripe may be configured only for approved partner Growth/Pro subscriptions. Consumer booking remains request-based: users request availability, partners confirm manually, and GoFunMotion does not collect consumer booking payment.

Growth and Pro pricing can remain visible as future partner packaging, but paid access should not be sold or automatically enabled until real partner fulfillment, refund, confirmation, tax, and support policies are ready.

## Transactional Email

Booking request notifications use Resend when configured. Booking requests still save if email is not configured; notification status is stored on the `bookingRequests` document.

Required Vercel environment variables:

- `RESEND_API_KEY`
- `EMAIL_FROM` such as `GoFunMotion <notifications@gofunmotion.com>`

Optional:

- `EMAIL_REPLY_TO`
- `BOOKING_REQUEST_FALLBACK_EMAIL`
- `INTERNAL_NOTIFICATIONS_EMAIL`

Verify the sending domain in Resend before using a `gofunmotion.com` sender.

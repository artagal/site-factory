# GoFunMotion Deals Pivot Implementation Plan

Status update: most Phase 1 and Phase 2 web-app work has been implemented in `apps/website`. Keep this plan as migration context, but use `README.md`, `AGENTS.md`, `docs/HANDOFF.md`, `docs/FIREBASE_LIVE_SETUP.md`, and `docs/FIREBASE_SCHEMA_GOFUNMOTION_DEALS.md` as the current operational references.

## Phase 1: Product Reset, Routes, Homepage, Find, Deals

Goal: replace the visible product direction without building the whole marketplace backend yet.

Tasks:

- Replace homepage with `Find something fun to do today.`
- Add new navigation:
  - Find
  - Deals
  - Date Night
  - Family
  - Partner
  - Sign In
  - CTA: Find My Plan
- Create starter routes:
  - `/find`
  - `/deals`
  - `/deals/[slug]`
  - `/date-night`
  - `/friends`
  - `/family`
  - `/partner`
  - `/pricing`
  - `/saved`
- Replace `/profile` content with saved plans, saved deals, booking requests, and preferences.
- Redirect or de-emphasize legacy routes:
  - `/challenge` -> `/find`
  - `/daily` -> `/find?when=today`
  - `/leaderboard` -> `/deals`
  - `/categories` -> marketplace categories or `/deals`
- Create new marketplace types:
  - city
  - category
  - business
  - listing
  - plan
  - booking request
  - partner application
- Create local demo data scaffolding for development only.
- Update sitemap route list and metadata to the new SEO strategy.

Acceptance criteria:

- User understands the product in 5 seconds.
- Main CTA leads to `/find`.
- Old XP/challenge terms are not visible as core product terms.
- Production does not pretend demo businesses are real.

## Phase 2: Firebase Data Model And Auth

Goal: update Firebase integration from challenge progress to marketplace data.

Tasks:

- Replace old Firestore helpers with new helpers for:
  - users
  - saved listings
  - saved plans
  - booking requests
  - partner applications
  - businesses
  - listings
  - admin checks
- Keep Google/email auth.
- Keep browsing public without login.
- Require login for:
  - saving deals
  - saving plans
  - submitting booking requests
  - profile
  - partner dashboard
  - admin dashboard
- Rebuild profile around marketplace data.
- Replace old analytics event names with:
  - `hero_cta_click`
  - `plan_generated`
  - `listing_viewed`
  - `listing_saved`
  - `plan_saved`
  - `booking_request_started`
  - `booking_request_submitted`
  - `partner_application_submitted`
  - `waitlist_submitted`
  - `login_clicked`

Acceptance criteria:

- Existing Firebase env pattern remains safe.
- Missing Firebase config does not crash the app.
- User can browse without login.
- User can sign in and save marketplace objects.

## Phase 3: Listings, Deal Pages, Booking Requests

Goal: make the core marketplace loop useful.

Tasks:

- Implement `/api/search` for listing filters.
- Implement `/api/plan` with rule-based planner:
  - city
  - when
  - who
  - budget
  - vibe
  - time available
  - indoor/outdoor
- Build `/deals` listing grid with filters and sort.
- Build `/deals/[slug]` detail pages.
- Implement save/share listing actions.
- Implement booking request form and `/api/booking-request`.
- Add booking request history to profile.
- Add empty city state and waitlist prompt.

Acceptance criteria:

- User can find a plan, view a deal, save it, and request booking.
- Booking request is saved to Firestore when logged in.
- If no listings exist, product still gives curated suggestions and waitlist path.
- No payment checkout is implemented.

## Phase 4: Partner Application And Dashboard

Goal: make the business side understandable and ready for supply acquisition.

Tasks:

- Build `/partner` landing page.
- Build `/partner/apply` application form.
- Implement `/api/partner-application`.
- Build `/partner/dashboard` for business users:
  - business profile
  - create/edit listing
  - listing status
  - booking requests
  - basic stats
- Ensure listings created by partners require admin approval before public visibility.

Acceptance criteria:

- Business can understand value proposition quickly.
- Partner application writes to Firestore.
- Business owner can manage only their own business/listings.
- No self-approval, featured, or promoted writes by business users.

## Phase 5: Admin Dashboard

Goal: enable controlled marketplace operations.

Tasks:

- Build `/admin` with `admins/{uid}` guard.
- Add admin views for:
  - partner applications
  - businesses
  - listings
  - cities
  - categories
  - booking request overview
  - global stats
- Add admin actions:
  - approve/reject partner applications
  - approve/reject businesses
  - approve/reject listings
  - feature/promote listings
  - manage cities/categories
- Update Firestore rules for admin-only actions.

Acceptance criteria:

- Normal users cannot access admin UI or admin writes.
- First admin is bootstrapped manually in Firebase Console by creating `admins/{uid}`.
- Admin can approve listings before public visibility.

## Phase 6: SEO, Polish, Mobile Testing

Goal: make the product showable and acquisition-ready.

Tasks:

- Update homepage metadata:
  - title: `GoFunMotion - Find Fun Things To Do Today`
  - description: `Discover local activities, last-minute deals, date ideas, family fun, and spontaneous plans based on your mood, time, budget, and city.`
- Build SEO pages:
  - `/date-night`
  - `/friends`
  - `/family`
  - `/cities/[citySlug]`
  - `/categories/[categorySlug]`
- Replace or add blog content:
  - best things to do when bored
  - date night ideas under $50
  - fun things to do with friends this weekend
  - family activities when it rains
  - how local businesses can fill empty slots
  - last-minute activities near you
- Update privacy and terms for marketplace and booking request model.
- Test mobile heavily:
  - iPhone width
  - Android width
  - large tap targets
  - no horizontal overflow
  - filters/forms usable with one thumb
- Run final checks:
  - `npm.cmd run typecheck`
  - `npm.cmd run build`
  - `npm.cmd test`

Acceptance criteria:

- Mobile homepage immediately communicates city + vibe + plan.
- SEO pages link back to `/find`.
- Terms clearly state GoFunMotion is a discovery platform and partners fulfill activities.
- Build and tests pass.

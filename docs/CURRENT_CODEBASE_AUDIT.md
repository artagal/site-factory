# Current Codebase Audit

Audit date: 2026-05-24

Status update: 2026-06-03

Repo: `C:\Projects\site-factory`

Main app: `apps/website`

## Summary

The original audit below identified the old GoFunMotion challenge product. The active web product has since been pivoted to **GoFunMotion Deals**: local discovery, activity deals, a rule-based plan finder, saved plans/deals, booking requests, partner applications, partner listing tools, and admin moderation.

Do not treat old challenge, XP, streak, rarity, daily mission, or leaderboard references in this document as current product direction. They are retained only as migration history and cleanup context.

## Tech Stack Found

- Next.js App Router.
- React 19.
- TypeScript.
- Tailwind CSS.
- Framer Motion.
- Firebase client SDK.
- Firebase Admin SDK.
- Vitest.
- Sitemap and robots generation scripts.

## Root Scripts

From `package.json`:

- `npm.cmd run dev`
- `npm.cmd run build`
- `npm.cmd run typecheck`
- `npm.cmd test`
- `npm.cmd run seo:audit`
- `npm.cmd run sitemap:generate`
- `npm.cmd run robots:generate`
- `npm.cmd run firebase:deploy:firestore`

No dedicated lint script is configured.

## Current Routes

Current App Router pages:

- `/`
- `/categories`
- `/categories/[categorySlug]`
- `/cities/[citySlug]`
- `/date-night`
- `/deals`
- `/deals/[slug]`
- `/family`
- `/find`
- `/friends`
- `/partner`
- `/partner/apply`
- `/partner/dashboard`
- `/pricing`
- `/profile`
- `/profile/settings`
- `/saved`
- `/waitlist`
- `/about`
- `/blog`
- `/blog/[slug]`
- `/login`
- `/privacy`
- `/terms`

Deprecated redirects:

- `/challenge` redirects to `/find`.
- `/daily` redirects to `/find?when=today`.
- `/leaderboard` redirects to `/deals`.

Current API routes:

- `/api/account/delete`
- `/api/admin/categories`
- `/api/admin/cities`
- `/api/admin/listings/moderate`
- `/api/admin/partner-applications/approve`
- `/api/admin/users/lookup`
- `/api/booking-request`
- `/api/categories`
- `/api/cities`
- `/api/events`
- `/api/partner-application`
- `/api/partner/booking-requests/status`
- `/api/partner/listings`
- `/api/plan`
- `/api/search`
- `/api/track`
- `/api/waitlist`

## Current Firebase Setup

Client:

- `apps/website/src/lib/firebase.ts`
- `apps/website/src/lib/auth.ts`
- `apps/website/src/lib/firestore.ts`

Server:

- `apps/website/src/lib/server/firebase-admin.ts`
- `apps/website/src/lib/server/api-response.ts`
- `apps/website/src/lib/server/rate-limit.ts`
- `apps/website/src/lib/server/stats.ts`

Current client env vars:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Current server env vars:

- `FIREBASE_SERVICE_ACCOUNT_JSON`

There is no active Stripe, checkout, or admin cron-secret env requirement.

Current Firestore rules support:

- Users can read/write their own profile documents.
- Users can read/write their own saved listings and saved plans through both web subcollections and FlutterFlow first-pass top-level collections.
- Public reads are allowed for active cities/categories and approved public businesses/listings.
- Booking requests require auth, are user-scoped, and allow partner/admin status handling.
- Partner applications and waitlist entries can be created publicly with constrained fields.
- Admin moderation is gated by `admins/{uid}`.
- Direct analytics writes remain blocked from clients.

The rules and indexes were updated for the GoFunMotion Deals model and dry-run compiled against `gofunmotion-prod` on 2026-06-01. They have not been deployed in this repo session.

## Remaining Deprecated Challenge Product Files

Types:

- `apps/website/src/types/challenge.ts`
- `apps/website/src/types/user.ts`

Challenge logic:

- `apps/website/src/lib/challenges.ts`
- `apps/website/src/lib/challengeEngine.ts`
- `apps/website/src/lib/dailyChallenge.ts`
- `apps/website/src/lib/localStorage.ts`
- `apps/website/src/lib/progressActions.ts`
- `apps/website/src/lib/badges.ts`
- `apps/website/src/lib/xp.ts`
- `apps/website/src/lib/rarity.ts`
- `apps/website/src/lib/leaderboard.ts`

Challenge UI:

- `apps/website/src/components/gofunmotion/Hero.tsx`
- `apps/website/src/components/gofunmotion/ChallengeGenerator.tsx`
- `apps/website/src/components/gofunmotion/ChallengeCard.tsx`
- `apps/website/src/components/gofunmotion/MissionMachine.tsx`
- `apps/website/src/components/gofunmotion/DailyChallenge.tsx`
- `apps/website/src/components/gofunmotion/DailyMissionBanner.tsx`
- `apps/website/src/components/gofunmotion/Leaderboard.tsx`
- `apps/website/src/components/gofunmotion/ProfileStats.tsx`
- `apps/website/src/components/gofunmotion/BadgeGrid.tsx`
- `apps/website/src/components/gofunmotion/StreakCounter.tsx`
- `apps/website/src/components/gofunmotion/XPBadge.tsx`
- `apps/website/src/components/gofunmotion/PhoneMissionPreview.tsx`
- `apps/website/src/components/gofunmotion/MomentumShowcase.tsx`

These files should be replaced, removed, or isolated during the pivot.

## Current Navigation

`apps/website/src/components/gofunmotion/Navbar.tsx` currently links to:

- Generator
- Modes
- Daily
- Leaderboard
- Ideas
- Login/Account
- Try it

This should be replaced with:

- Find
- Deals
- Date Night
- Family
- Partner
- Sign In
- Find My Plan

## Current SEO State

`apps/website/src/app/layout.tsx` and `apps/website/src/app/page.tsx` still use old metadata:

- `GoFunMotion - Replace Scrolling With Real Life`
- challenge/anti-doomscroll keywords

`apps/website/src/lib/site-routes.ts` still includes old route priorities for `/challenge`, `/daily`, `/leaderboard`, and `/categories`.

Blog content in `apps/website/src/lib/blog.ts` is heavily oriented around:

- anti-doomscrolling
- challenges
- XP/streak concepts
- AI challenge generator

The pivot should replace or add content for:

- things to do today
- fun things to do near me
- date night ideas
- family activities
- friends/group activities
- last-minute activity deals
- local business empty slots

## Current Tests

Tests found:

- `tests/serverRateLimit.test.ts`
- `tests/seo.test.ts`
- `tests/scripts.test.ts`
- `tests/content.test.ts`
- `tests/localStorage.test.ts`

Future tests should add:

- planner matching tests
- listing search/filter tests
- booking request payload tests
- partner application validation tests
- slug/format tests for listings, cities, and categories

## Main Pivot Risks

- Old challenge product code is spread across pages, components, types, Firestore helpers, localStorage, analytics, and SEO.
- Firestore rules are now Deals-oriented, but deployment should be treated as a release step. FlutterFlow public/user list reads are currently guarded; re-enable them only with approved-only and user-owned Builder filters.
- Current profile page is built around old progress, not saved plans/deals.
- Current analytics events use old challenge event names.
- Current sitemap still exposes old product routes.
- Current waitlist is mobile challenge-app oriented.

## Recommended Preservation

Keep:

- Next.js/Tailwind/Firebase/Vercel foundation.
- Dark premium visual style, if simplified for marketplace clarity.
- Auth/account setup.
- Firebase Admin helper pattern.
- Server response/rate-limit helpers.
- SEO/sitemap/robots infrastructure.
- Blog rendering infrastructure.

Replace:

- Product copy.
- Route map.
- Homepage.
- Challenge generator.
- Daily challenge.
- Leaderboard.
- Progress profile.
- Challenge-specific Firestore schema and rules.

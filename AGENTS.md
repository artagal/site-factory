# Site Factory Agent Guide

## Project Status

This repository currently contains the GoFunMotion website in `apps/website`. The existing app is a polished Next.js product prototype, but its current product model is now deprecated.

The repository also contains the FlutterFlow AI workspace for the first GoFunMotion Deals app pass:

- Workspace: `gofunmotion-ffai`
- FlutterFlow project: `GoFunMotion Deals`
- Project ID: `go-fun-motion-deals-vl4mj8`
- Project URL: `https://app.flutterflow.io/project/go-fun-motion-deals-vl4mj8`
- Main DSL: `gofunmotion-ffai/dsl/create.dart`

The new direction is **GoFunMotion Deals**:

- Main headline: `Find something fun to do today.`
- Main CTA: `Find My Plan`
- Product: local discovery, real activity deals, AI-assisted plan finding, partner listings, booking requests, saved plans, saved deals, business dashboard, and admin approval.

Do not keep expanding the old fake challenge/XP/streak/leaderboard product. Future work should remove, redirect, or heavily de-emphasize that functionality.

## How To Run

Use PowerShell on Windows and prefer `npm.cmd`.

From the repo root:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run typecheck
npm.cmd run build
npm.cmd test
```

Useful scripts:

```powershell
npm.cmd run sitemap:generate
npm.cmd run robots:generate
npm.cmd run seo:audit
npm.cmd run firebase:login
npm.cmd run firebase:deploy:firestore
```

There is no dedicated lint script configured right now. Use `npm.cmd run typecheck`, `npm.cmd run build`, and `npm.cmd test` as the main quality gates.

## Current Structure

- `apps/website`: Next.js app using TypeScript, Tailwind CSS, React, Firebase client SDK, Firebase Admin SDK, and Framer Motion.
- `apps/website/src/app`: App Router pages and API routes.
- `apps/website/src/components/gofunmotion`: GoFunMotion Deals UI components for discovery, deals, plan finder, navigation, and marketplace cards.
- `apps/website/src/lib`: SEO helpers, Firebase helpers, local rules planner, demo marketplace data, Firestore sync, analytics, and server helpers.
- `apps/website/src/types`: GoFunMotion Deals domain types for cities, categories, businesses, listings, plans, booking requests, partner applications, and user profiles.
- `firestore.rules`: Firestore rules for the GoFunMotion Deals marketplace, saved plans/deals, booking requests, partner tools, and admin approval.
- `firestore.indexes.json`: Firestore indexes for marketplace and user-owned Deals queries.
- `scripts`: sitemap, robots, SEO audit, WordPress draft, and content calendar helpers.
- `docs`: project workflow and deployment docs.

## Deprecated Product Redirects

The old challenge-product URLs should stay redirected or de-emphasized:

- `/challenge` redirects to `/find`.
- `/daily` redirects to `/find?when=today`.
- `/leaderboard` redirects to `/deals`.
- `/categories` redirects to `/deals`, while `/categories/[categorySlug]` remains a marketplace category detail route.

Current account routes are Deals-oriented:

- `/profile`: saved plans, saved deals, booking requests, and preferences.
- `/profile/settings`: profile settings and account actions.
- `/login`: Firebase auth UI.
- `/waitlist`: city/user/business interest list.

## Firebase

The app already has Firebase client and server architecture:

- Client config: `apps/website/src/lib/firebase.ts`
- Auth helpers: `apps/website/src/lib/auth.ts`
- Firestore helpers: `apps/website/src/lib/firestore.ts`
- Admin SDK: `apps/website/src/lib/server/firebase-admin.ts`

Client env vars expected:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

Server env vars used by existing admin routes:

```text
FIREBASE_SERVICE_ACCOUNT_JSON
```

Do not hardcode secrets. Do not commit env files with real credentials.

## Coding Conventions

- Keep TypeScript strict and explicit.
- Prefer small, focused components.
- Prefer existing repo patterns before adding abstractions.
- Use lowercase kebab-case filenames for new shared components unless the folder already uses a different convention.
- Use `apply_patch` for manual edits.
- Avoid broad rewrites unless the pivot requires them.
- Keep app behavior Vercel-ready and Firebase-safe.
- Preserve local fallback behavior where it still makes sense.

## Product Constraints

- Do not add OpenAI, Gemini, Google Places, Ticketmaster, Eventbrite, Stripe, or paid APIs yet.
- Do not implement payment checkout yet.
- Do not present fake businesses as real production partners.
- Demo listings should be local/dev only, or clearly marked as demo if ever shown.
- Users must be able to browse and use the plan finder before login.
- Login is needed only for saves, booking requests, profile, partner dashboard, and admin.
- Partner-created listings should require admin approval before public visibility.

## New Product Direction

Build GoFunMotion Deals around:

- Local activities.
- Last-minute deals.
- AI/rule-based plan finder.
- Date night planning.
- Friends/group planning.
- Family/kids activities.
- Partner listings.
- Booking requests.
- Saved plans and saved deals.
- Business dashboard.
- Admin approval dashboard.

Remove or de-emphasize:

- Fake XP as the main product.
- Public leaderboard.
- Random challenge generator as the main product.
- Meaningless `Complete` button.
- Streaks as the main value.
- Challenge rarity as a core mechanic.

Read these handoff docs before implementing the pivot:

- `docs/HANDOFF.md`
- `docs/FLUTTERFLOW_BUILDER_FIRST_PLAN.md`
- `docs/FLUTTERFLOW_CUSTOM_CODE_POLICY.md`
- `docs/FLUTTERFLOW_APP_STATE_POLICY.md`
- `docs/FLUTTERFLOW_BUILDER_FRIENDLY_AUDIT.md`
- `docs/PRODUCT_SPEC_GOFUNMOTION_DEALS.md`
- `docs/CURRENT_CODEBASE_AUDIT.md`
- `docs/PIVOT_IMPLEMENTATION_PLAN.md`
- `docs/FIREBASE_SCHEMA_GOFUNMOTION_DEALS.md`

For FlutterFlow work, Builder-first always. Keep screens visually editable in FlutterFlow Builder, use native widgets/components/actions/state before custom code, and treat manual Builder edits as the source of truth.

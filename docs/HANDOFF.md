# GoFunMotion Deals Handoff

## Current Project Status

The repo is `C:\Projects\site-factory`. The main app is `apps/website`, a Next.js App Router site using TypeScript, Tailwind CSS, Framer Motion, Firebase client SDK, and Firebase Admin SDK.

The current web product has been pivoted to **GoFunMotion Deals**:

- Local discovery and activity deals.
- Rule-based plan finder at `/find`.
- Public approved/demo deals at `/deals`.
- Saved plans and saved deals.
- Booking requests instead of checkout.
- Partner applications and partner listing tools.
- Admin moderation for categories, cities, partner applications, and listings.
- Firebase login and account settings with Google, Apple, and email surface.

The old challenge/XP/streak/leaderboard product is deprecated and should not be expanded.

## FlutterFlow App Status

A first Builder-native FlutterFlow app has been created and pushed.

- FlutterFlow project: `GoFunMotion Deals`
- Project ID: `go-fun-motion-deals-vl4mj8`
- Project URL: `https://app.flutterflow.io/project/go-fun-motion-deals-vl4mj8`
- Local FlutterFlow AI workspace: `C:\Projects\site-factory\gofunmotion-ffai`
- Last pushed FlutterFlow commit: `0LmSN7gNC3FeveuF3USY`
- Main DSL file: `gofunmotion-ffai/dsl/create.dart`
- Context snapshot: `gofunmotion-ffai/PROJECT_CONTEXT.md`

Operational note: `dsl/create.dart` is the first-create flow. Do not rerun it against `go-fun-motion-deals-vl4mj8` after the initial push, because it will try to recreate existing pages/components. Future live changes should use inspect-first edits in `dsl/edit.dart` or manual Builder edits.

Created FlutterFlow pages:

- `SplashPage`
- `DiscoverPage`
- `FindPlanPage`
- `DealsPage`
- `DealDetailPage`
- `SavedPage`
- `ProfilePage`
- `SignInPage`
- `ResetPasswordPage`
- `WaitlistPage`
- `PartnerPage`
- `PartnerApplyPage`
- `PartnerDashboardPage`
- `AdminPage`

Created FlutterFlow components:

- `SectionHeader`
- `DealCard`
- `PlanStepCard`
- `EmptyState`

Created FlutterFlow collections:

- `users`
- `cities`
- `categories`
- `businesses`
- `listings`
- `savedListings`
- `savedPlans`
- `bookingRequests`
- `partnerApplications`
- `waitlist`

Builder-first status:

- Custom widgets: none
- Custom actions: none
- Custom functions: none
- API groups/endpoints: none
- Pub dependencies: none

Validation already run:

```powershell
dart analyze dsl\create.dart
dart test
flutterflow ai test
flutterflow ai validate dsl\create.dart --project-name "GoFunMotion Deals" --find-or-create --commit-message "Validate GoFunMotion Deals FlutterFlow app"
flutterflow ai status go-fun-motion-deals-vl4mj8
flutterflow ai inspect go-fun-motion-deals-vl4mj8
flutterflow ai validate dsl\edit.dart --project-id go-fun-motion-deals-vl4mj8 --commit-message "Add GoFunMotion animated splash assets"
flutterflow ai run dsl\edit.dart --project-id go-fun-motion-deals-vl4mj8 --commit-message "Add GoFunMotion animated splash assets"
flutterflow ai validate dsl\create.dart --project-name "GoFunMotion Deals Validation" --allow-new-project --commit-message "Validate GoFunMotion brand assets scaffold"
```

Recent FlutterFlow safety edit:

- `dsl/edit.dart` replaced broad on-load reads on `DiscoverPage`, `DealsPage`, and `SavedPage` with safe state clears.
- Native Builder-visible notices were inserted next to the affected lists.
- Public/user listing and saved-data lists are now intentionally empty until approved-only and user-scoped Builder query filters are wired.
- `dsl/create.dart` was also hardened so future scaffold runs do not reintroduce unfiltered public/user reads.

Recent brand asset edit:

- Generated web and FlutterFlow brand assets in `apps/website/public/brand`, `apps/website/public/icons`, `apps/website/public/og`, and `gofunmotion-ffai/assets/brand`.
- Added `SplashPage` as the FlutterFlow initial page. It displays `assets/brand/gofunmotion-splash-motion.gif`, waits briefly, then navigates to `DiscoverPage`.
- Configured FlutterFlow app icon path and static splash image path through `dsl/edit.dart` and mirrored the same setup in `dsl/create.dart`.
- Added website PWA manifest, favicon, Apple touch icon, OG image, and navbar mark integration.

Manual setup still needed:

- Verify Firebase project connection inside FlutterFlow.
- Enable Firebase Auth providers in Firebase Console: email/password, Google, Apple, and anonymous if guest sign-in remains.
- Deploy GoFunMotion Deals Firestore rules/indexes after confirming the release window. The local dry-run compile against `gofunmotion-prod` passed on 2026-06-01.
- Add approved-only filters to FlutterFlow `listings` queries before using real production listing data, then remove the temporary query-guard notices.
- Visually QA the animated `SplashPage` in FlutterFlow Preview and on target devices.
- Add an admin role document or custom claims before using `AdminPage` for moderation.
- Seed approved listings or clearly marked demo records.

## What Has Already Been Built

Current app capabilities:

- Working Next.js app in `apps/website`.
- Existing global layout with navbar, footer, mobile CTA, animated background, and fonts.
- Deals homepage with `Find something fun to do today.` and `Find My Plan` as the primary CTA.
- `/find`, `/deals`, deal detail, saved/profile, partner, pricing, and admin surfaces for the Deals flow.
- Firebase client config through env vars.
- Firebase auth helpers for Google, Apple, anonymous, email login/signup, sign out, and profile updates.
- Firebase Admin helper using `FIREBASE_SERVICE_ACCOUNT_JSON`.
- Firestore helpers for saved listings, saved plans, booking requests, partner applications, businesses, listings, and user profiles.
- Current API routes:
  - `/api/account/delete`
  - `/api/booking-request`
  - `/api/partner-application`
  - `/api/partner/listings`
  - `/api/partner/booking-requests/status`
  - `/api/admin/categories`
  - `/api/admin/cities`
  - `/api/admin/listings/moderate`
  - `/api/admin/partner-applications/approve`
  - `/api/admin/users/lookup`
  - `/api/plan`
  - `/api/search`
  - `/api/track`
  - `/api/waitlist`
- Firestore rules for the GoFunMotion Deals marketplace, saved user records, booking requests, partner tools, and admin approval.
- SEO helpers, sitemap generation, robots generation, and blog support.
- Basic tests for scripts, SEO, localStorage, content, and server rate limit.

## What Should Be Removed Or Replaced

The following should not remain as core product value:

- `/challenge` as the main product route.
- `/daily` daily challenge as a retention loop.
- `/leaderboard` XP/streak social layer.
- XP, streak, badges, rarity, and `Complete` as central concepts.
- Old challenge templates and challenge engine as the primary generator.
- Blog content that mainly targets anti-doomscroll challenge keywords.
- Homepage copy centered on `Replace scrolling with real life`.
- Waitlist copy centered on mobile streaks, city quests, creator packs, and challenge modes.

Recommended legacy route handling:

- `/challenge` -> redirect to `/find`.
- `/daily` -> redirect to `/find?when=today`.
- `/leaderboard` -> redirect to `/deals`.
- `/categories` -> rebuild as marketplace categories or redirect to `/deals`.
- `/waitlist` -> replace with city waitlist or redirect to the homepage waitlist section.

## What Should Be Kept

Keep and adapt:

- Next.js App Router setup.
- Tailwind and current premium dark visual direction.
- Firebase client and admin environment-variable pattern.
- Auth helpers, but update copy and sync targets for saved plans/deals/booking requests.
- SEO helper architecture.
- Sitemap/robots scripts.
- API response and rate-limit helpers.
- Account navigation and login route, but update messaging for Deals.
- General component quality and responsive polish.
- Blog rendering infrastructure, but replace content strategy.

## What The Next Codex Session Should Do First

1. Read:
   - `AGENTS.md`
   - `docs/FLUTTERFLOW_BUILDER_FIRST_PLAN.md`
   - `docs/FLUTTERFLOW_CUSTOM_CODE_POLICY.md`
   - `docs/FLUTTERFLOW_APP_STATE_POLICY.md`
   - `docs/FLUTTERFLOW_BUILDER_FRIENDLY_AUDIT.md`
   - `docs/PRODUCT_SPEC_GOFUNMOTION_DEALS.md`
   - `docs/CURRENT_CODEBASE_AUDIT.md`
   - `docs/PIVOT_IMPLEMENTATION_PLAN.md`
   - `docs/FIREBASE_SCHEMA_GOFUNMOTION_DEALS.md`
2. Confirm the worktree is clean:
   ```powershell
   git status --short
   ```
3. Create a focused branch for the pivot.
4. Start Phase 1:
   - Replace homepage positioning.
   - Add `/find`, `/deals`, `/partner`, `/pricing`, `/saved`.
   - Replace navigation.
   - Redirect old challenge routes.
   - Add new marketplace types and demo data scaffolding.
5. Run:
   ```powershell
   npm.cmd run typecheck
   npm.cmd run build
   npm.cmd test
   ```

## Recommended Next Prompt

```text
Work inside C:\Projects\site-factory only.

Read AGENTS.md and all GoFunMotion Deals handoff docs in docs/.
For FlutterFlow work, read the four FLUTTERFLOW_* docs first and keep the build Builder-first.

Implement Phase 1 of the GoFunMotion Deals pivot:
- replace the homepage with the new "Find something fun to do today" product direction
- create /find, /deals, /partner, /pricing, and /saved starter routes
- update navigation and footer for Find, Deals, Date Night, Family, Partner, Sign In
- redirect or de-emphasize old /challenge, /daily, /leaderboard routes
- create new TypeScript types and local demo data scaffolding for cities, categories, businesses, listings, plans, and booking requests
- do not add paid APIs, payments, or AI APIs
- do not present fake businesses as real production partners

Run npm.cmd run typecheck, npm.cmd run build, and npm.cmd test.
Fix all errors.
Commit with: Start GoFunMotion Deals pivot
```

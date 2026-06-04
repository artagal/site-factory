# FlutterFlow Builder-Friendly Audit

## Audit Status

Date: 2026-06-01

Repo: `C:\Projects\site-factory`

FlutterFlow AI workspace: `C:\Projects\site-factory\gofunmotion-ffai`

FlutterFlow project: `GoFunMotion Deals`

Project ID: `go-fun-motion-deals-vl4mj8`

Project URL: `https://app.flutterflow.io/project/go-fun-motion-deals-vl4mj8`

Last pushed FlutterFlow commit: `0LmSN7gNC3FeveuF3USY`

Verification commands run:

```powershell
dart analyze dsl\create.dart
dart analyze dsl\create.dart dsl\edit.dart
dart test
flutterflow ai test
flutterflow ai validate dsl\create.dart --project-name "GoFunMotion Deals" --find-or-create --commit-message "Validate GoFunMotion Deals FlutterFlow app"
flutterflow ai run dsl\create.dart --project-name "GoFunMotion Deals" --find-or-create --commit-message "Create GoFunMotion Deals app"
flutterflow ai validate dsl\create.dart --project-name "GoFunMotion Deals Validation" --allow-new-project --commit-message "Validate hardened GoFunMotion Deals scaffold"
flutterflow ai validate dsl\edit.dart --project-id go-fun-motion-deals-vl4mj8 --commit-message "Guard unsafe unfiltered listing queries"
flutterflow ai run dsl\edit.dart --project-id go-fun-motion-deals-vl4mj8 --commit-message "Guard unsafe unfiltered listing queries"
flutterflow ai validate dsl\edit.dart --project-id go-fun-motion-deals-vl4mj8 --commit-message "Add GoFunMotion animated splash assets"
flutterflow ai run dsl\edit.dart --project-id go-fun-motion-deals-vl4mj8 --commit-message "Add GoFunMotion animated splash assets"
flutterflow ai validate dsl\create.dart --project-name "GoFunMotion Deals Validation" --allow-new-project --commit-message "Validate GoFunMotion brand assets scaffold"
flutterflow ai refresh-context go-fun-motion-deals-vl4mj8
flutterflow ai status go-fun-motion-deals-vl4mj8
flutterflow ai inspect go-fun-motion-deals-vl4mj8
dart run dsl\create.dart --project-name "GoFunMotion Deals Validation" --allow-new-project --dry-run
.\node_modules\.bin\firebase.cmd deploy --only firestore:rules,firestore:indexes --dry-run
```

Note: the CLI prints `Can't load Kernel binary: Invalid kernel binary format version (expected 130, found 125)` after successful commands in this environment. The commands above completed successfully where noted by `[OK]`, `All tests passed`, or a successful status/inspect output.

Do not rerun `dsl/create.dart` against the already-created bound project. After the first push, `gofunmotion-ffai` is bound to `go-fun-motion-deals-vl4mj8`, and create flows will conflict with existing pages/components such as `SectionHeader`. Future live changes should use inspect-first edit flows in `dsl/edit.dart` or narrowly scoped Builder edits.

## Live Inventory

Pages: 14

- `SplashPage` initial route `/splash`
- `DiscoverPage` route `/`
- `FindPlanPage` route `/find`
- `DealsPage` route `/deals`
- `DealDetailPage` route `/deal-detail`
- `SavedPage` route `/saved`
- `ProfilePage` route `/profile`
- `SignInPage` route `/sign-in`
- `ResetPasswordPage` route `/reset-password`
- `WaitlistPage` route `/waitlist`
- `PartnerPage` route `/partner`
- `PartnerApplyPage` route `/partner/apply`
- `PartnerDashboardPage` route `/partner/dashboard`
- `AdminPage` route `/admin`

Components: 4

- `SectionHeader`
- `DealCard`
- `PlanStepCard`
- `EmptyState`

Collections: 10

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

App State: 2

- `activeCity`
- `planPersona`

No custom code is present:

- Custom widgets: 0
- Custom actions: 0
- Custom functions: 0
- API groups/endpoints: 0
- Pub dependencies: 0

## Builder-Native Audit

| Surface | Status | Notes |
| --- | --- | --- |
| Light/dark mode theme | Built | Theme tokens declared in `gofunmotion-ffai/dsl/create.dart`. |
| Brand assets | Built | App icon, static splash, animated GIF splash, OG image, PWA icons, and navbar mark generated. |
| Animated splash | Built | `SplashPage` uses `assets/brand/gofunmotion-splash-motion.gif`, waits briefly, then routes to `DiscoverPage`. |
| Public browsing | Built | Discovery, plan finder, deals, and detail pages exist before login. |
| Email auth | Built in FlutterFlow DSL | Firebase Console provider still must be enabled/verified. |
| Apple auth | Built in FlutterFlow DSL | Apple setup still must be completed/verified in Firebase Console and Apple Developer. |
| Google auth | Built in FlutterFlow DSL | Google provider still must be enabled/verified in Firebase Console. |
| Guest auth | Built in FlutterFlow DSL | Anonymous provider must be enabled if guest sign-in is kept. |
| Saved plans/deals | Built first pass | Collections exist; live lists are guarded until user-owned Builder filters are connected. |
| Booking requests | Built first pass | Creates `bookingRequests`; no payment checkout. |
| Partner application | Built first pass | Creates `partnerApplications` pending review. |
| Partner dashboard | Built first pass | UI scaffold; role-based Firebase rules still required. |
| Admin dashboard | Built first pass | UI scaffold; admin-only Firebase rules/custom claims still required. |

## Data Model Audit

The generated FlutterFlow project includes these fields:

- `users`: `display_name`, `photo_url`, `uid`, `created_time`, `phone_number`, `email`, `role`, `city`, `createdAt`, `updatedAt`
- `cities`: `name`, `state`, `slug`, `isActive`, `sortOrder`
- `categories`: `name`, `slug`, `icon`, `isActive`, `sortOrder`
- `businesses`: `name`, `ownerUserId`, `contactEmail`, `city`, `status`, `description`, `createdAt`, `updatedAt`
- `listings`: `title`, `description`, `businessName`, `businessRef`, `category`, `city`, `neighborhood`, `priceLabel`, `dealLabel`, `bookingMode`, `imageUrl`, `status`, `isApproved`, `isDemo`, `startsAt`, `endsAt`, `createdAt`, `updatedAt`
- `savedListings`: `userId`, `listingRef`, `listingTitle`, `city`, `createdAt`
- `savedPlans`: `userId`, `city`, `persona`, `when`, `budget`, `vibe`, `summary`, `createdAt`
- `bookingRequests`: `userId`, `listingRef`, `listingTitle`, `contactName`, `contactEmail`, `partySize`, `message`, `status`, `createdAt`
- `partnerApplications`: `businessName`, `contactName`, `contactEmail`, `city`, `category`, `description`, `status`, `createdAt`
- `waitlist`: `email`, `city`, `interest`, `createdAt`

## Current Risks

1. Firebase Console configuration is not confirmed from this repo. Enable and verify Email/password, Apple, Google, and Anonymous providers before auth QA.
2. Firestore rules and indexes have been updated and dry-run compiled, but they have not been deployed. Deploy only after confirming the live Firebase release window.
3. Admin access in the first pass is a UI scaffold. It must be protected by `admins/{uid}`, custom claims, or a trusted backend path before production.
4. Public/user listing queries are intentionally disabled on `DiscoverPage`, `DealsPage`, and `SavedPage` after commit `Fo0wIyFfekjgrjknaTlF`; production FlutterFlow queries must add approved-only filters (`isApproved == true`, and an approved/published status) or user-owned filters before live records are shown.
5. Demo preview cards on `DiscoverPage` are clearly labeled, but real partner content must come from approved Firestore records.

## Next Builder-First Steps

1. Open `https://app.flutterflow.io/project/go-fun-motion-deals-vl4mj8` and visually QA the created pages in FlutterFlow Builder.
2. Connect/verify Firebase settings in FlutterFlow and Firebase Console.
3. Preview `SplashPage` and verify the animated GIF loops smoothly before the wait-and-route action sends users to `DiscoverPage`.
4. Add approved-only filters to FlutterFlow `listings` queries and user-owned filters to saved-data queries before using live production data, then remove the query-guard notices.
5. Deploy updated Firestore rules/indexes for GoFunMotion Deals after confirming the release window.
6. Seed only clearly marked demo listings locally, or add approved real partner listings.
7. Polish mobile spacing, empty/loading states, and auth return flows in Builder before adding any custom code.
8. Use `dsl/edit.dart` for future live changes; do not rerun `dsl/create.dart` against the bound project.

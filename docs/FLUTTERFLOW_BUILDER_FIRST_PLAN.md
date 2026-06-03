# FlutterFlow Builder-First Plan

## Purpose

GoFunMotion Deals should be built so the main app can be edited visually inside FlutterFlow Builder. The web prototype in `apps/website` is useful for product copy, route structure, Firebase schema, and visual direction, but the FlutterFlow app should not be recreated as page-sized custom widgets or hidden Dart layouts.

Core rule:

```text
Builder-first always.
```

Normal UI must remain editable through FlutterFlow Builder: pages, layouts, buttons, cards, filters, navigation, colors, typography, spacing, and conditional visibility.

## Current Status

- Repo: `C:\Projects\site-factory`
- Current product: GoFunMotion Deals web prototype in `apps/website`
- Backend direction: Firebase Auth, Firestore, Firebase Admin backed server routes where needed
- FlutterFlow AI workspace: `C:\Projects\site-factory\gofunmotion-ffai`
- FlutterFlow project: `GoFunMotion Deals`
- FlutterFlow project ID: `go-fun-motion-deals-vl4mj8`
- FlutterFlow URL: `https://app.flutterflow.io/project/go-fun-motion-deals-vl4mj8`
- Last pushed FlutterFlow commit: `0LmSN7gNC3FeveuF3USY`
- Last context refresh: `flutterflow ai refresh-context go-fun-motion-deals-vl4mj8`

The first Builder-native FlutterFlow app pass has been created and pushed. Before making future edits, run a fresh project inspection and treat any manual FlutterFlow Builder edits as source of truth.

## Product Scope

GoFunMotion Deals is a local discovery and activity deals app.

Primary promise:

```text
Find something fun to do today.
```

Primary CTA:

```text
Find My Plan
```

The app should focus on:

- Local activities
- Last-minute deals
- Rule-based plan finding
- Date night planning
- Friends and group planning
- Family and kids activities
- Partner listings
- Booking requests
- Saved plans and saved deals
- Business dashboard
- Admin approval dashboard

Do not rebuild the old XP, streak, challenge, leaderboard, or random mission product as the main experience.

## App Screen Map

### Public Consumer Screens

- Splash or launch screen
- Home / Discovery
- Find My Plan
- Deals list
- Deal detail
- City page
- Category page
- Date Night
- Friends
- Family
- City waitlist
- About
- Privacy
- Terms

### Auth Screens

- Sign in
- Sign up
- Forgot password
- Role selection if needed
- Onboarding preferences

Auth layout should stay Builder-editable. Preferred order:

- Email/password form at top
- Primary CTA clearly visible
- Apple Sign In below
- Google Sign In below
- Guest or continue browsing option only where product flow needs it

### Authenticated Consumer Screens

- Saved plans
- Saved deals
- Booking request history
- Profile
- Preferences
- Account settings
- Delete account / soft delete flow

### Partner Screens

- Partner landing
- Partner application
- Partner dashboard
- Business profile editor
- Listing create/edit
- Booking requests
- Basic analytics

### Admin Screens

- Admin dashboard
- Partner application review
- Business review
- Listing approval queue
- Cities management
- Categories management
- Booking request overview
- Global stats

Admin screens must be protected by an `admins/{uid}` document or equivalent backend role check. Normal users must not be able to approve businesses, approve listings, feature listings, promote listings, or manage categories.

## Main User Flows

### Browse Without Login

1. User opens Home.
2. User sees `Find something fun to do today.`
3. User taps `Find My Plan`.
4. User chooses city, when, who, budget, vibe, time available, and indoor/outdoor.
5. User sees a suggested plan and matching listings.
6. User can view deals and public details without signing in.

Use Builder-native forms, dropdowns, chips, segmented controls, and conditional sections.

### Save Plan Or Deal

1. User taps Save on a plan or deal.
2. If signed out, use native navigation to Auth with a return page parameter.
3. After login, write to `users/{uid}/savedPlans` or `users/{uid}/savedListings`.
4. Show a Builder-native toast/snackbar or visible success state.

### Booking Request

1. User opens deal detail.
2. User taps `Request Booking`.
3. If signed out, navigate to Auth with return parameter.
4. User completes native form fields.
5. App creates a `bookingRequests` record through a safe client write or trusted endpoint.
6. Confirmation screen shows status `pending`.

No consumer checkout should be implemented yet.

### Partner Application

1. Business opens Partner page.
2. Business taps `Apply to List Your Business`.
3. Business submits native form fields.
4. App creates `partnerApplications/{applicationId}`.
5. Admin reviews before any public visibility.

### Partner Listing Creation

1. Approved owner opens Partner Dashboard.
2. Owner creates or edits a listing with Builder-native form fields.
3. Listing status remains `pending_approval` until admin approval.
4. Owner cannot self-approve, feature, promote, or bypass review.

### Admin Approval

1. Admin signs in.
2. Admin document is checked through backend query or secure endpoint.
3. Admin reviews applications, businesses, listings, cities, and categories.
4. Admin actions update moderation fields only through authorized paths.

## Builder-Friendly Components To Create

Use FlutterFlow Components for repeated UI. Do not turn these into custom widgets unless Builder cannot reasonably build the UI.

- AppHeader
- BottomNav
- HeroPlanFinder
- PlanFinderForm
- DealCard
- DealListItem
- DealDetailHeader
- PriceAndAvailabilityBlock
- CategoryChip
- FilterBar
- EmptyState
- LoadingState
- ErrorState
- SaveButton
- ShareButton
- BookingRequestFormSection
- ProfileCard
- PreferenceSection
- PartnerStatCard
- PartnerListingRow
- AdminApprovalRow
- CTASection
- AuthProviderButton

## Backend Collections

Target Firestore collections are defined in `docs/FIREBASE_SCHEMA_GOFUNMOTION_DEALS.md`.

Use FlutterFlow Firebase collections and backend queries where possible:

- `users`
- `admins`
- `cities`
- `categories`
- `businesses`
- `listings`
- `bookingRequests`
- `partnerApplications`
- `waitlist`
- `globalStats`
- `analyticsEvents`

User subcollections:

- `users/{userId}/savedListings`
- `users/{userId}/savedPlans`

## Navigation Plan

Use native FlutterFlow navigation actions and page parameters.

Recommended route parameters:

- Deal detail: `listingId` or `listingRef`
- City page: `cityId` or `citySlug`
- Category page: `categoryId` or `categorySlug`
- Booking request: `listingId`, `businessId`
- Partner listing editor: `listingId`, optional for edit mode
- Admin detail screens: relevant document reference

Avoid custom redirect code for simple flows. For role routing, use Builder-native conditional actions:

- If no profile, go to Role Selection or onboarding.
- If onboarding incomplete, go to onboarding.
- If role is `business`, go to Partner Dashboard.
- If role is `user`, go to Home or Saved.
- If admin doc exists, show Admin entry.

## App State Plan

Minimize App State. See `docs/FLUTTERFLOW_APP_STATE_POLICY.md` for strict rules.

Allowed likely App State:

- Selected city only if used across many unrelated tabs
- Current user role only if not easily available from auth/profile query
- Theme mode only if app-wide and not handled by FlutterFlow theme
- Active environment flag only if needed for demo/live separation

Prefer Page State for:

- Current filters on Deals page
- Map/list toggle
- Current tab selection
- Form step
- Loading state
- Temporary selected date/time

Prefer Page Parameters for:

- Selected listing
- Selected city
- Selected category
- Return URL after auth

## Custom Code Exceptions

Custom code is not part of the first pass unless approved. If later needed, keep it isolated and documented in `docs/FLUTTERFLOW_CUSTOM_CODE_POLICY.md`.

Possible valid exceptions:

- Secure server endpoint calls for operations that cannot expose secrets
- Complex geolocation or map behavior Builder cannot support
- Small pure formatting functions if Builder formatting is insufficient
- External SDK integration only after explicit approval

Not allowed:

- Full-page custom widgets
- Custom actions for simple navigation
- Custom actions for role redirects Builder can express
- Custom functions for basic label formatting
- Hardcoded UI in Dart that should be visually editable

## Manual Edit Protection

If the user manually edits pages inside FlutterFlow Builder:

- Those manual edits become the source of truth.
- Do not overwrite edited screens.
- Do not regenerate manually edited screens from scratch.
- Do not replace manual UI with custom widgets.
- Ask before modifying manually edited screens.

## First Implementation Phases

1. Create or bind FlutterFlow AI workspace. Done: `gofunmotion-ffai`.
2. Inspect live project before edits. Done after push with `status`, `inspect`, and `refresh-context`.
3. Create theme tokens for light and dark mode. Done in `dsl/create.dart`.
4. Create brand assets, app icon, static splash, and animated GIF splash. Done in `scripts/generate-gofunmotion-assets.py`, mirrored to `gofunmotion-ffai/assets/brand`.
5. Create Builder-native components. Done: `SectionHeader`, `DealCard`, `PlanStepCard`, `EmptyState`.
6. Build animated intro splash. Done: `SplashPage` is initial and routes to `DiscoverPage`.
7. Build public discovery flow. Done: `DiscoverPage`, `FindPlanPage`, `DealsPage`, `DealDetailPage`.
8. Build auth with email, Apple, and Google. Done via Firebase Auth DSL; provider setup still must be confirmed in Firebase Console.
9. Build saved plans and saved deals. Done as first-pass pages/collections; live saved lists are guarded until user-owned query filters are connected in Builder.
10. Build booking request flow. Done as first-pass `DealDetailPage` form/write.
11. Build partner application and dashboard. Done as first-pass `PartnerPage`, `PartnerApplyPage`, `PartnerDashboardPage`.
12. Build admin approval flow. Done as first-pass `AdminPage`; production role rules still required.
13. Audit buttons, navigation, App State, and custom code. Done in `docs/FLUTTERFLOW_BUILDER_FRIENDLY_AUDIT.md`.
14. Polish screens for App Store and Google Play screenshots. Not started.

## Manual Setup Still Needed

- Confirm FlutterFlow project access: `https://app.flutterflow.io/project/go-fun-motion-deals-vl4mj8`.
- Configure the live Firebase project in FlutterFlow settings if it is not already connected.
- Enable Firebase Auth providers in Firebase Console: email/password, Apple, Google, and anonymous/guest.
- Deploy the dry-run-validated Firestore rules/indexes for approved public listings, user-owned saves, partner-owned records, and admin-only moderation.
- Visually QA `SplashPage` and native splash behavior in FlutterFlow Preview and on mobile devices.
- Reconnect `DiscoverPage`, `DealsPage`, and `SavedPage` list widgets with approved-only and user-owned Builder query filters, then remove the temporary query-guard notices.
- Add first admin document manually.
- Confirm Apple and Google sign-in setup in Firebase Console.
- Confirm Vercel/server endpoints for sensitive operations.
- Decide whether FlutterFlow app shares the same Firebase project as the web prototype.

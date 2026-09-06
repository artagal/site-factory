# GoFunMotion Reliability And Usability Pass

## Scope

Focused fixes to authentication, saved plans, demo-map navigation, free planning,
and mobile profile readability. This is not certification that every feature or
role has been tested on a physical device.

## Website Changes

- Known invalid, expired, revoked, disabled-user and deleted-user Firebase sessions
  return an authentication failure instead of throwing an HTTP 500. Token
  verification checks revocation; backend outages are not disguised as bad login.
- Saved plans expose the saved itinerary, prices, timing, backups and safe local
  deal links. Delete requires confirmation, prevents duplicate requests, preserves
  records on failure and ignores stale completions after switching accounts.
- Profile totals stay in three compact mobile columns with theme-aware colors.
- Free-budget suggestions no longer include paid coffee/dessert stops. Invalid
  listing prices are excluded and optional purchases are not labelled free.
- Demo-map rows retain approximate locations but have no live listing reference.
- The homepage no longer advertises a fixed 50% discount without inventory evidence.
- Existing lime/cyan visual identity is preserved. Sticky filters were checked
  against the header with no gap and a maximum 84px mobile height.
- Updated release smoke checks to current deal-first copy. Empty inventory is
  valid but does not count as booking QA readiness; demo-only inventory gets a
  warning. Demo detail pages must be non-bookable/noindex or unavailable. Missing
  and malformed sessions must return 401; partner checkout must require auth.

## FlutterFlow

- Existing project: `go-fun-motion-deals-vl4mj8`; screens remain Builder-native.
- SDK updated to installed release `0.0.40+2`, build `c40fa0b8`.
- Scoped entry: `gofunmotion-ffai/dsl/review_readiness_patch.dart`.
- Email/Google/Apple auth retains provider configuration and now uses server-checked
  role routing. Consumer sign-in can return to the interrupted plan/deal flow.
- Onboarding carries the consumer return destination. No save or booking request
  is automatically submitted after sign-in.
- Added retry/loading/error controls for account access and saved collections.
- Final push: `xMUPgH4ABKLseVIpyVaE`, following `6VPR40Iasb9KhVLYhw1W` and
  `eZ6ykM6WuGAzbtDt7P82`. Fresh
  generated-code inspection found and then verified the fix for success-only API
  continuations in SavedPage. Both failure and success branches now load subsequent
  sections. Compiled-graph tests cover all eight outcome combinations for page load
  and refresh. The map also hides live-detail navigation for legacy demo statuses,
  so this guard works before the website's map-reference change is deployed.
- Removed nested primary scrolling for the saved-plan and saved-deal lists;
  the outer page owns the gesture. Generated readback confirms primary=false and
  NeverScrollableScrollPhysics while retaining shrink wrapping.
- Generated source was inspected, not manually edited. Build `1.0.0 (7)` was
  created in Builder, uploaded and processed VALID by Apple. It is internal-testable
  and external beta review is WAITING_FOR_REVIEW, not approved.

## Verification

- `npm.cmd run typecheck`: passed.
- `npm.cmd run build`: passed, including ten server-runtime module probes.
- `npm.cmd test`: 265 passed; 25 emulator-dependent tests skipped in this command.
- Combined Firebase Emulator suites: 20 passed (Firestore rules, marketplace
  lifecycle, native workspace). Includes application, approval, listing, save,
  booking, confirmation, notification records, and signed simulated Stripe events
  with duplicate/stale-event checks. No actual charge or email delivery is implied.
  The outdated billing assertion was updated to check public entitlement facts
  while keeping provider customer/subscription IDs private. Java 21 required the
  documented process-local TCP fallback.
- Browser suite: 22 passed across desktop and iPhone-sized Chromium viewports.
  The final compact-profile change was additionally checked by all eight saved-plan
  tests. These use isolated account adapters and make no live booking/deletion writes.
- SEO audit: 58 pages, zero issues.
- Production launch smoke: 87 passed, two warnings, zero failures. Warnings:
  local env audit intentionally skipped and matching inventory is demo-only.
- Production account readback: saved plans, saved listings and booking requests
  return 401 with missing/invalid tokens and 200 for the reviewer account. The
  updated saved-plan expansion was also checked in the authenticated browser.
- FlutterFlow focused tests: 27 passed; live dry-run and push succeeded. There are 177
  nonblocking project warnings, including nested primary scrollables; not all are
  fixed by this focused pass.
- Screenshots: `output/qa/improvements-2026-09-06` and
  `output/qa/saved-profile-2026-09-06`.

## Publication And Remaining Gates

- Website fixes published via the existing GitHub integration after CLI login
  remained unavailable. Preview `dpl_8ckGZNBZ7S1LBfu71kEBTuVarWeb` was READY and
  checked. Production `dpl_HrNd3uVeQgvX1tQ3dGnzhAW2mPCv` is READY and owns
  gofunmotion.com/www aliases. Production source commit: `13e5ddb0`; workspace
  commit: `a0c7085c`, with identical source trees. No secrets or local output
  directories were included.
- Apple review reply was submitted September 6 at 12:56 PDT; protected customer
  credentials were reverified. Build 7 is VALID/internal-testable and waiting for
  external review. Build 6 remains rejected historically. No password is stored
  in these documents.
- Still needed: signed iOS device QA, successful external Apple re-review,
  external tester availability, real email delivery and purchase/restore checks.
- See `TESTFLIGHT_RELEASE_STATUS.md` for the current Apple evidence and limitations.

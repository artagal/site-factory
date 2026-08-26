# GoFunMotion UX and Functional Audit

Date: 2026-08-26. Scope: website and the existing FlutterFlow project
`go-fun-motion-deals-vl4mj8`. This is implementation and QA evidence, not a claim
that production payments, device authentication, or TestFlight are ready.

## Fixed in This Pass

### Website

- Rebuilt the homepage around last-minute deals, a compact city/time bar, prices,
  availability, and one clear discovery flow. The planner remains secondary.
- Reduced sticky controls to a single mobile row. The sticky bar touches the
  header without a gap on desktop and mobile. More filters expand separately.
- Reworked deal cards and details: show price, genuine calculated discount,
  time, and remaining spots once; no `Was Flexible`, invented galleries, or maps.
- Added image fallback and an optimized, illustrative workshop photo. Demo
  offers remain explicitly not bookable and are not counted as real city supply.
- Removed silent city defaults and hidden planner defaults from deal search.
  Results retain the selected city, group, budget, category, and exact price cap.
  No-match states no longer broaden into unrelated city/demo inventory.
- Excluded expired and sold-out offers from matching. The planner uses approved
  inventory; without matches it returns general curated ideas, not fake venues.
- Improved login labels, password visibility, reset-password entry, return links,
  and already-signed-in state. Browsing still requires no account.
- Improved profile loading, retry, partial failures, saved-item links, and request
  status presentation. Failed reads do not masquerade as zero saved items.
- Save buttons load their actual saved state. Share cancellation is silent.
- Booking uses valid `HH:mm` time input and remaining-capacity limits. Persistent
  success replaces the form only after a confirmed server write. Missing storage
  returns an error instead of pretending a booking/application/waitlist was saved.
- Updated mobile navigation, icon labels, keyboard focus, escape/outside-click
  dismissal, full brand visibility at 320px, and light/dark surface contrast.

### FlutterFlow

- Kept native widgets, actions, API bindings, and local page state editable in
  Builder. No custom full-screen widget was introduced; generated Dart was not edited.
- Replaced audited placeholder discovery cards with a typed, approved-only feed:
  `GET /api/mobile/deals`. It excludes demos and supports city, time, category,
  and budget. It does not call an AI provider.
- Added real city/category ID selection, compact filters, loading/error/empty
  states, retry, and navigation with the real listing reference.
- Removed prototype widgets by exact key to avoid sibling-path shifts and
  preserve unrelated Builder content. Added an idempotence regression test.
- Added readable bottom-navigation labels and contained nested browse scrolling.
- Replaced nonfunctional sign-in gates in Account, Partner, and Admin with
  native navigation. Replaced overflowing full-name avatar text with an icon.
- Guarded a missing detail reference before reading Firestore.
- Booking reads current field-controller values instead of delayed page state,
  hides the send button after success, and presents a persistent confirmation.
- Saved refresh now reloads saved plans, saved deals, and booking requests. Failure
  states stop the loading state and expose retry.
- Native admin review deliberately hands off to the protected web dashboard;
  this pass does not claim full native admin moderation.

Latest pushed FlutterFlow commit: `EPZ8qOhrVAPdblFk4neD`.
The refreshed export was inspected for the actual generated action chains.

## Verification

| Gate | Result |
| --- | --- |
| `npm.cmd run typecheck` | Passed |
| `npm.cmd run build` | Passed, 83 prerendered pages generated |
| `npm.cmd run check:server-runtime` | Passed, 6 built route handlers loaded without Node `require(esm)` |
| `npm.cmd test` | 191 passed, 9 emulator-dependent tests skipped |
| `npm.cmd run seo:audit` | 48 pages, 0 issues |
| FlutterFlow DSL analysis | No issues |
| FlutterFlow declaration/export regression tests | 14 passed |
| Fresh generated Flutter analysis | 0 errors; 307 warnings and 1,605 informational diagnostics |
| Mobile release configuration checks | Failed: iOS/Android Firebase config and Google iOS callback |

Generated analysis used `--no-fatal-infos --no-fatal-warnings`. Its exit code is
not a clean lint result. Most diagnostics are generator style/import guidance;
Builder also reports auth-navigation and nested-list warnings that still need
device/runtime QA. The missing Firebase configuration validation remains a known
release blocker, not something this patch bypasses for release.

Browser checks used the in-app browser against `http://localhost:3016`:

- Actual widths 320, 390, and 1440px; light/dark states; no horizontal overflow on
  the inspected screens. At 320px the sticky filter measured 61.6px high, with its
  top at 64px, exactly the header bottom. Desktop sticky gap also measured 0px.
- Home, deals, a demo detail, find, date-night, friends, family, login, profile,
  saved, partner application/dashboard, admin, waitlist, city/category and support.
- Selecting Austin in the planner produced curated ideas and the appropriate
  waitlist, not unrelated or fictional bookable offers.
- Password visibility, mobile menu navigation/dismissal, theme switching, images,
  and signed-out role gates were checked. No real booking or email was submitted.
- Legacy challenge/daily/leaderboard/category redirects lead to find/deals.
- FlutterFlow Builder was opened and the updated native Discover structure and
  navigation were visually inspected. Builder placeholders are not device data.

The Playwright suite source was updated but not run as a standalone browser
session. Emulator integration tests and authenticated physical-device QA remain
separate gates. All 17 app pages were inspected structurally; this is not a claim
that every page has passed interactive runtime testing.

## Preview Runtime Follow-up

The first Preview (`9ed8f17`) reached READY but its mobile feed returned 500.
Vercel runtime logs identified `ERR_REQUIRE_ESM` while Firebase Admin Auth loaded
`jwks-rsa -> jose`. The same failure was reproduced locally with
`node --no-experimental-require-module` against the built route's lazy userland.

`next.config.mjs` now bundles that dependency chain using `transpilePackages`.
No SDK downgrade or weakened token validation was used. The new
`scripts/check-server-runtime.mjs` is also a root `postbuild` gate and checks six
compiled handlers without calling them or performing external writes.

This approach follows Next's [package bundling configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages)
and accounts for the [jwks-rsa runtime requirement](https://github.com/auth0/node-jwks-rsa/blob/master/CHANGELOG.md).
Preview HTTP verification remains separate from build success. The browser
requires the user's Vercel login before visual Preview inspection; local browser
QA is not described as remote visual QA.

## Remaining Release Work

1. Deploy the web changes to production, especially `/api/mobile/deals`, before distributing the
   updated mobile app. Native API groups currently target `gofunmotion.com`.
2. Verify Vercel environment configuration for Firebase Admin, OpenAI, Resend,
   and subscription billing without exposing values. The local Vercel CLI is not
   authenticated; connected Vercel reads and the existing Git-based Preview pipeline
   are available. A Preview build is not a production promotion.
3. Regenerate/upload the existing matching Firebase mobile files through Builder,
   then confirm the fresh export includes them and the Google callback URL scheme.
4. Verify Google, Apple, email, deletion, saves, role routing and request-status
   changes on real devices with approved test accounts and genuine offers.
5. Run a consented end-to-end partner approval/deal/request/email-delivery cycle,
   and a separate Stripe subscription/webhook test. No paid transaction was made.
6. Re-run Firestore emulator security/integration suites on a working emulator.
   Existing Windows Java/loopback issues prevented these suites in this environment.
7. Resolve the remaining Firebase/Google Cloud dependency chain: production audit
   has 6 moderate advisories and no high/critical advisories. Do not force a major
   downgrade solely to silence the audit.
8. Extend city/category SEO route lookup beyond the static catalog so newly
   admin-created locations/categories receive their own landing pages.
9. Add server-side booking idempotency and stricter requested-slot validation
   before a broad launch; a request is not a reservation or capacity lock.
10. Build a fresh signed iOS archive and Android release, then perform TestFlight
    and Internal Testing. Current state is **not ready for store submission**.

## Asset Credit

The homepage workshop image is illustrative, not a claimed partner venue:
[Sander Breneman on Unsplash](https://unsplash.com/photos/a-group-of-women-sitting-at-a-table-working-on-pottery-kJiPUr1KQSE).
Local asset: `apps/website/public/images/activities/pottery-workshop.jpg`.

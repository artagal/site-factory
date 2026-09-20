# Mobile Discovery and Map Release

Verified on September 20, 2026. This is a scoped continuation, not certification
of every existing page or payment flow.

## Delivered

- FlutterFlow project: `go-fun-motion-deals-vl4mj8`.
- Latest native commit: `Ir3aJTf49XYvOMyc6Aii`.
- 64 native pages: the existing 62 plus `ExampleActivitiesPage` and
  `ExampleActivityPage`. Forms, cards, navigation and example detail remain
  editable native FlutterFlow widgets. No new custom widgets/actions were added.
- Bottom navigation: Home, Map, Deals, Saved, Account. The existing AI planner
  remains reachable from Home; it no longer crowds the bottom bar.
- Map is visible immediately, including the empty-live-inventory state.
  City filters and live/example selection are native. Only the map canvas uses
  a read-only hosted Leaflet WebView with horizontal/vertical gestures enabled.
- Fifteen clearly labeled example activities across Miami, Los Angeles,
  New York, Austin and San Diego. Examples have no booking, save or payment
  references. Nothing was inserted into production partner collections.
- Native cards show current/original prices, discount, time, spots and city.
  Example detail shows description, duration, group fit and terms.
- Same-location offers share one map marker. Small-screen popups scroll inside
  the 300px map instead of covering the full app.
- Filters are disabled during loading to prevent overlapping requests from
  replacing the selected catalog. Back arrows use theme text colors in both modes.

## Server Deployment

- `/api/mobile/discovery`: public, read-only, rate-limited, validated query input.
  Live results require published/approved open listings and approved businesses;
  demo businesses/listings are excluded. Response exposes no private contacts.
- Explicit `catalog=examples` uses local fixtures and does not query Firestore.
- CORS is open only on this public endpoint for FlutterFlow Web Preview. No
  credentials are accepted or exposed by it.
- Map assets: `/maps/deals.html`, locally vendored Leaflet and license.
- Production commit: `3f4e88d0c75a821594673ee8d31934e6226db870`.
- Vercel: `dpl_2faWNP736iDFMKzDqtYP3mc5U3Rg`, verified `READY`.
- Public checks: examples 15, cities 5, bookable examples 0; live inventory 0.
  Zero live inventory is an honest empty state, not a claim that partners exist.

## Verification

- Typecheck passed.
- Website build passed; production build also `READY`.
- Unit tests: 272 passed, 25 skipped (emulator suites not run here).
- SEO audit: 58 pages, zero issues.
- Map Playwright: ten passed locally and ten passed against production.
  Covers mobile/desktop, compact canvas, grouped markers, errors and retry.
- Native DSL regression tests: 29 passed.
- Generated Flutter analysis: zero errors; 1,115 warnings and 3,258 info items
  remain, mostly generator lint. This is not a warning-free analyzer pass.
- Fresh generated Flutter web build passed on Flutter 3.35.7 after resolving
  dependencies with that toolchain. Generated source was not manually edited.
- `scripts/qa-native-discovery.mjs` provides a native-web visual smoke check.
  Catalog, example-detail navigation, five-tab navigation, map markers, Austin
  city selection and both color modes rendered at 390px. Screenshots are in
  `output/qa/native-discovery`. Visual assertions passed, but the script exits 1
  because four WebView callback exceptions were captured.
  This is not an error-free native-web run: FlutterFlow's generated WebView
  `onWebViewCreated` callback throws while reading the web controller connector.
  The canvas and native card navigation still render. The generated wrapper was
  not hand-edited; verify a Builder/SDK fix and native-device behavior separately.

## Release Boundary

Apple still has builds 7, 6 and 3 only. Build 7 is `VALID`, with internal and
external `IN_BETA_TESTING`. It does not include this patch.

A new iOS archive/upload was not started: the browser tool currently reports no
connected browsers, so FlutterFlow Mobile Deployment is unavailable. Next:

1. Open the existing FlutterFlow project in the connected in-app browser.
2. Confirm the latest native commit and use the next unused build number (8 if
   no later build has appeared), retaining version 1.0.0 and the opaque logo.
3. Start the cloud iOS deployment. Check its exact artifact and Apple build ID.
4. Verify encryption declaration, processing, internal/external group access and
   What to Test instructions for Map, examples and existing authenticated flows.
5. Test on an actual iPhone before asserting device readiness.

The SDK export omits uploaded launcher media and contains placeholder native
icons; the static release script still fails those three asset checks. This is
the documented incomplete-export caveat, not evidence that the previously
verified Builder/cloud icon regressed. Do not patch generated icons manually.

## Source Control

Local Git write auth is stale/wrong-account. The authenticated GitHub connector
was used for the reviewed web release instead. Unrelated local edits were
preserved. BeautyDrop was read only; only its map/navigation interaction patterns
were adapted, not its users, credentials, or business records.

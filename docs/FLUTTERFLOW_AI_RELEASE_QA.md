# GoFunMotion Native AI Release QA

Date: 2026-08-26. Project: `go-fun-motion-deals-vl4mj8`.

## Release Decision

**Do not submit to TestFlight yet.** Native screens, subscription API and store UI are
implemented, but Builder Firebase access, RevenueCat products/webhook configuration,
Apple deployment credentials, a signed iOS archive, and device QA are still gates.

## Editable App Scope

62 native pages now include the dedicated partner editor, AI Finder, AI Support,
customer/partner workspaces and mobile administration. The 45-page expansion,
API dependencies and bounded team/subscription scope are documented in
`docs/FLUTTERFLOW_NATIVE_WORKSPACE_2026-08-26.md`.
The five native AI experiences are search, planning, partner title/description,
editable booking messages, and support. Consent is off by default; no automatic
booking, publication, payment, or email sending is added. Manual Builder screens
remain authoritative, and the update flow guards against duplicate AI panels.

API group `GoFunMotionAssistant` contains AskGoFunMotion, GetAssistantCities, and
SaveAssistantPlan. `GoFunMotionAccount` now uses SyncMobileAccountV2 for canonical
profile sync and onboarding routing. `GoFunMotionWorkspace` provides protected
reads, writes, ownership lookup and moderation actions. Existing
GoFunMotionWeb calls remain available. Keys and approval decisions stay server-side.

## Authentication

Email/password, Google, Apple, password reset, and sign-out use native actions.
Browse without an account navigates directly instead of creating anonymous users.
After authentication, the app calls the protected existing profile-sync endpoint.
The old FlutterFlow snake_case profile auto-create setting is explicitly cleared;
setting its DSL boolean to false alone does not clear an existing remote setting.

Firebase CLI verified active iOS and Android apps in `gofunmotion-prod`, both using
`com.gofunmotion.app`. Existing configuration files are in the ignored
`.firebase-mobile-config` folder. Do not add those files or provider keys to Git.

The generated export still needs those configuration files uploaded/regenerated in
Builder. Google also needs the reversed client ID URL scheme in the fresh iOS
Info.plist. The Apple entitlement exists, but it is not proof of provider setup or
valid provisioning. Follow the official [Firebase connection instructions](https://docs.flutterflow.io/integrations/firebase/connect-to-firebase/).

## Repeatable Checks

The native subscription update adds server-verified RevenueCat purchase/restore,
provider-safe entitlement projection and fail-closed store readiness. The final
Builder/AI push is `c8irzdiI2I3LNsLi1jil`; the one-time state migration was pushed as
`kynC72KjEKpYRVRGxHW7`. Current checks include 23 production Firestore indexes READY,
a previously successful 22/22 Auth/Firestore Emulator suite, website typecheck,
208 passing tests with 23 emulator-dependent skips, and a production build with
86 routes. The native Dart suite has 25 passing tests.
Fresh generated-runtime analysis has 0 errors, 1,057 warnings and 3,364 information
diagnostics. `--no-fatal-infos --no-fatal-warnings` was used only to make the analyzer
exit reflect errors; warnings remain logged. This is not a signed archive or a
physical-device authentication test.

The expanded export also passed `flutter build web --no-pub --no-wasm-dry-run` on
installed Flutter 3.35.7 after resolving dependencies with that same SDK.
The default Flutter 3.44 build fails on the exported Font Awesome 10.12 dependency
(`IconData` subclassing). Generated code and the global SDK were not patched.
Match the actual FlutterFlow CI runtime before native release. The branded splash
is present and the square launcher source is selected and synced in Builder, but a
fresh AI export still contains Flutter's default iOS and Android launcher binaries.
Launcher processing and Firebase configuration remain separate release gates.

Historical AI-only verification: website typecheck/build passed (86 routes), 163
tests passed with 9 emulator-dependent cases skipped, SEO audited 48 pages with
0 issues, and 7 Dart DSL tests passed. Full generated-runtime analysis on snapshot
`wT56n3Ap7KxKZ8BxjZBS` found 0 errors, 311 warnings, and 1,581 informational
diagnostics. These warnings cause a nonzero analyzer exit and are not suppressed.
The final follow-up only changes Support's retry text, not authentication or APIs.
The follow-up export `UPoR15r5E2jaCwp6Ucso` was also checked with scoped Flutter
analysis of `lib/ai_support_page`: 0 errors (existing generated warnings remain).

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run seo:audit
cd gofunmotion-ffai
dart test test/app_test.dart
flutter analyze --no-pub dsl
cd generated_code
flutter analyze --no-pub
```

From the repository root, run:

```powershell
powershell -NoProfile -File scripts/check-mobile-release.ps1
```

That script reads the actual export and fails closed on missing Firebase files,
identity mismatch, missing Google callback scheme, legacy user auto-creation,
missing JSON escaping, or embedded provider secrets. It does not bypass errors
by editing generated files and is not a substitute for a signed build.

The subscription/rules/mobile workspace suite previously passed 22/22 against
demo-only Auth and Firestore emulators; production data was not used for tests. The
latest retry could not start Firestore because the Codex Windows process environment
blocked Java NIO loopback selector creation. That infrastructure failure occurred
before test collection and does not replace the last successful emulator result.

## Required Live QA

### RevenueCat configuration recorded on 2026-08-26

- Project `9a13f722`, App Store app `appbf5abba616`.
- Default offering `partner_plans` (`ofrng834c6d4be5`).
- Packages `growth_monthly` and `pro_monthly` use the matching monthly App Store
  product identifiers from the server allowlist.
- Entitlements `growth` and `pro` each have one associated product.
- RevenueCat still reports `Could not check` for both App Store products and the
  in-app purchase credential needs attention. These catalog records do not make a
  purchase available until App Store Connect has matching approved/configured
  products and RevenueCat can validate them.
- The private RevenueCat server key, authenticated webhook value and public SDK key
  still need to be placed directly in Vercel. No key value belongs in this repo.

1. Log in to Vercel in the open InApp Browser tab. Add the approved BeautyDrop
   OpenAI key directly to server env, verify Firebase Admin, set AI budget limits,
   redeploy, and verify the new mobile endpoint against that deployment.
2. Upload/regenerate the existing matching Firebase mobile config in Builder.
   Verify email/Google/Apple providers and Android SHA certificates. Do not enable
   native auto-create of the old user-document shape.
3. Configure RevenueCat `growth`/`pro` entitlements, products, the
   `partner_plans` offering, the authenticated webhook, and Vercel private env.
   Verify purchase, cancellation, expiry, account switching, and restore with the
   exact Firebase UID App User ID before enabling production packages.
4. Log in to App Store Connect, confirm the exact app record/bundle and signing
   access, then configure FlutterFlow Mobile Deployment. No Apple credentials or
   signed IPA have been supplied or created by this task.
5. Complete in-app account deletion before release. The server deletion endpoint
   exists, but a native confirmation/re-authentication flow and owner/retention
   behavior still need review and testing.
6. On a physical iPhone, verify each sign-in method, cancellation, sign-out,
   password reset, new user profile creation, return routing, and saved items.
7. Test AI off/on, provider outage, empty city, quote/newline/Unicode requests,
   plan saves, detail navigation, and explicit booking submission with a real
   approved offer. Confirm the owner gets the request and notification.
8. Verify 320/390/430-point layouts, keyboard/safe areas, long text, VoiceOver,
   large text, and real result images. Builder screenshots are not device QA.
9. Build a fresh signed IPA, inspect compile errors and signing, upload it, and
   wait for App Store Connect processing before assigning an internal tester.
   Complete privacy/AI disclosures and export-compliance questions accurately.

The latest branch Preview for commit `276fb22` completed successfully at
`https://site-factory-lu0f3f0p0-artagal.vercel.app`. Vercel Authentication protects
that Preview, so unauthenticated probes reached the protection layer rather than the
two new API handlers. Runtime probes must be repeated after Vercel sign-in or on the
production deployment.

Apple sign-in must be tested on a device or simulator, not FlutterFlow Run Mode.
See [Apple login](https://docs.flutterflow.io/integrations/authentication/firebase/apple/)
and [App Store deployment](https://docs.flutterflow.io/deployment/apple-app-store-deployment/).

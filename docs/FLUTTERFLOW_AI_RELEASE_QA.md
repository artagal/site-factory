# GoFunMotion Native AI Release QA

Date: 2026-08-26. Project: `go-fun-motion-deals-vl4mj8`.

## Release Decision

**Do not submit to TestFlight yet.** Native screens and API code are implemented,
but a signed iOS archive, mobile Firebase configuration, backend deployment, and
physical-device auth/booking checks are still release gates.

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

Latest workspace expansion (`jExsfCMwThaAVIG3GIyo`): 199 regular tests, 8 dedicated
Auth/Firestore Emulator tests, and 22 Dart tests passed. Website typecheck passed.
Fresh generated-runtime analysis has 0 errors, 1,057 warnings and 3,364 information
diagnostics. `--no-fatal-infos --no-fatal-warnings` was used only to make the analyzer
exit reflect errors; warnings remain logged. This is not a signed archive or a
physical-device authentication test.

The expanded export also passed `flutter build web` on installed Flutter 3.35.7.
The default Flutter 3.44 build fails on the exported Font Awesome 10.12 dependency
(`IconData` subclassing). Generated code and the global SDK were not patched.
Match the actual FlutterFlow CI runtime before native release; legacy startup
assets and Firebase configuration are still separate release gates.

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

The auth/Firestore emulator suite was attempted with an isolated demo project.
It could not start on this Windows host: Java failed to create its loopback
selector (`Unable to establish loopback connection`, `Invalid argument: connect`).
Changing the selector provider and forcing IPv4 did not fix it. Do not report the
skipped emulator tests as passed or run destructive tests against production.

## Required Live QA

1. Log in to Vercel in the open InApp Browser tab. Add the approved BeautyDrop
   OpenAI key directly to server env, verify Firebase Admin, set AI budget limits,
   redeploy, and verify the new mobile endpoint against that deployment.
2. Upload/regenerate the existing matching Firebase mobile config in Builder.
   Verify email/Google/Apple providers and Android SHA certificates. Do not enable
   native auto-create of the old user-document shape.
3. Log in to App Store Connect, confirm the exact app record/bundle and signing
   access, then configure FlutterFlow Mobile Deployment. No Apple credentials or
   signed IPA have been supplied or created by this task.
4. Complete in-app account deletion before release. The server deletion endpoint
   exists, but a native confirmation/re-authentication flow and owner/retention
   behavior still need review and testing.
5. On a physical iPhone, verify each sign-in method, cancellation, sign-out,
   password reset, new user profile creation, return routing, and saved items.
6. Test AI off/on, provider outage, empty city, quote/newline/Unicode requests,
   plan saves, detail navigation, and explicit booking submission with a real
   approved offer. Confirm the owner gets the request and notification.
7. Verify 320/390/430-point layouts, keyboard/safe areas, long text, VoiceOver,
   large text, and real result images. Builder screenshots are not device QA.
8. Build a fresh signed IPA, inspect compile errors and signing, upload it, and
   wait for App Store Connect processing before assigning an internal tester.
   Complete privacy/AI disclosures and export-compliance questions accurately.

Apple sign-in must be tested on a device or simulator, not FlutterFlow Run Mode.
See [Apple login](https://docs.flutterflow.io/integrations/authentication/firebase/apple/)
and [App Store deployment](https://docs.flutterflow.io/deployment/apple-app-store-deployment/).

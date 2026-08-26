# FlutterFlow Builder-Friendly Audit

## Audit Status

Date: 2026-08-26

Repo: `C:\Projects\site-factory`

FlutterFlow AI workspace: `C:\Projects\site-factory\gofunmotion-ffai`

FlutterFlow project: `GoFunMotion Deals`

Project ID: `go-fun-motion-deals-vl4mj8`

Project URL: `https://app.flutterflow.io/project/go-fun-motion-deals-vl4mj8`

Last pushed FlutterFlow commit: `c8irzdiI2I3LNsLi1jil`

Current FlutterFlow AI SDK: `0.0.40`

Current verification commands:

```powershell
dart format dsl\edit.dart dsl\partner_deal_editor.dart test\app_test.dart
flutter analyze --no-pub dsl
dart test test\app_test.dart
dart run dsl\edit.dart --project-id go-fun-motion-deals-vl4mj8 --dry-run
dart run dsl\edit.dart --project-id go-fun-motion-deals-vl4mj8
```

The workflow run compiled the edit DSL, refreshed the generated snapshot, and pushed
commit `wwz20MyZFy9OJjjh19wG`. That initial Dart test suite had two passing tests: create
scaffold compilation and current bound-project edit-flow declaration. Full edit
compilation is additionally validated during the push, not by a device test.

The theme and idempotent panel update was pushed in commit `eb8yZjm8Hu6km2fAJPaz`.
The installed SDK was invoked with `dart run dsl/edit.dart` after the global CLI
refused an older release-channel artifact. No SDK rollback was performed.

Commit `qubBLrHzUI6Dz1opc20a` fixes the old literal typography colors so headings and
body text follow the light/dark theme. The corrected dark preview was verified in
FlutterFlow Builder after the push.

Commit `lVx6wdUETSPp7umcZP0m` replaces the oversized home hero with a compact
native deal-first header and one Tonight's Deals CTA. The edit validation and both
Dart tests passed; generated code was refreshed successfully.

Earlier baseline checks on 2026-08-25, before the dedicated editor:

- `npm.cmd run typecheck`: passed.
- `npm.cmd run build`: passed, 85 generated routes.
- `npm.cmd test`: 73 passed, 9 skipped.
- `npm.cmd run seo:audit`: 48 pages, 0 issues.
- Generated Dart analysis: 0 errors, 231 warnings, 1,388 informational diagnostics.
  The warnings are not suppressed or represented as a clean lint pass.
- Reapplying the partner edit flow passed validation without duplicate panels or
  duplicate action outputs.

Do not run `dsl/create.dart` against this bound project. All future automated changes
must be inspect-first, narrowly scoped edits in `dsl/edit.dart`. Manual Builder edits
remain the source of truth and must be preserved.

## Live Inventory

### Native AI And Auth Continuation (2026-08-26)

- Live MCP status confirms 17 pages, 4 components, 24 data structs, and only two
  global App State fields. New AI request/results/consent state is page-local.
- Native AI Finder and Support, real plan cards, booking-message consent, and
  partner-copy consent are described in `OPENAI_AI_FEATURES.md`. New screens remain
  editable in Builder. The only new custom function is the reference adapter below.
- JSON escaping and UTF-8 are enabled for assistant requests, plan snapshots, and
  authenticated existing writes. `dsl/migrate_api_encoding.dart` migrates endpoint
  settings in place, preserving API identities. It is separate because SDK ensure
  helpers reject changed settings. Subsequent full edit pushes validated successfully.
- Existing AI pages are not redeclared during later edits. A structural guard rejects
  duplicate/missing AI panels. No manual Builder layout was replaced with custom UI.
- Native email/Google/Apple actions sync the shared profile API. The old profile
  auto-create setting is explicitly cleared. Fresh code no longer calls
  `maybeCreateUser`; post-login and already-signed-in paths use `goNamedAuth`/`goNamed`.
- Guest browsing now navigates directly. No new anonymous identity is created.
- The existing BeautyDrop OpenAI key passed two small authorized server-process
  checks, including real Smart Search with canonical filters. No key was persisted
  locally, added to FlutterFlow, or committed.
- Website typecheck and build passed (86 routes); 163 tests passed, 9 skipped. SEO
  audit: 48 pages, 0 issues. DSL analysis: no issues; 7 Dart tests passed.
- The fresh full generated-runtime analysis found 0 errors, 311 warnings, and 1,581
  informational diagnostics. The command exits 1 for warnings; this is not a clean
  lint result or a signed archive. Generated imports/deprecations were not hidden.
- The emulator suite could not
  start because Windows Java could not create a loopback selector. A production data
  test was not used as a substitute. See the release QA document for exact blockers.
- Builder previews of AI Finder and Support were inspected. No physical-device,
  native OAuth, signed archive, or TestFlight processing result is claimed.

#### New Custom Function

| Field | Value |
| --- | --- |
| Name / type | `goFunMotionListingReference`, custom function |
| Purpose | Convert a result listing ID to the existing native detail-page reference parameter |
| Used by | Native AI Finder and FindPlan result cards |
| Why not native | The API returns IDs; the existing page requires a typed Firestore reference |
| Input / output | String ID to nullable `DocumentReference` for `listings/{id}` |
| Validation | Rejects empty, slash-containing, dot, and double-dot IDs |
| Secrets / I/O | None; no read, write, network call, or UI |
| Risk / decision | Low; keep as a narrow adapter, Firestore still enforces approval |
| Maintenance | Inspect the actual generated Dart after each SDK/export change |

The full release gate is `FLUTTERFLOW_AI_RELEASE_QA.md`. TestFlight remains blocked
until matching Firebase config is in Builder, Vercel receives the server env,
account deletion is completed, and a fresh signed device-tested build is processed.

### Native Editor Continuation (2026-08-25)

The dedicated editor was pushed in `QgQztfRdUH9NpuTjLDWs`. The follow-up
`49LhsyniP7zohROjMjuN` improves control contrast, adds a visible category label,
and fixes native date-picker theme and cancellation behavior. A fresh remote
inventory confirms 15 pages. The generated runtime snapshot was refreshed by
both pushes.

- A dedicated native `PartnerDealEditorPage` replaces the long create-only form in
  the partner dashboard. Create and Edit share the same screen and page parameters.
- The form contains title, description, category, was/now prices, remaining spots,
  and native start/end date-time pickers. AI suggestions update editable text only.
- Draft saves retain the returned listing ID, so a later submission updates that
  same document. Submission always returns the deal to admin review.
- The partner write API merges partial edits with the existing listing before
  applying its server-side field allowlist. Omitted photos, terms, duration, group
  types, and booking settings are preserved.
- Native date timestamps are validated and stored in UTC. Availability labels use
  the city's timezone; the editor explicitly displays device-local dates.
- Public date filters derive today/tonight/tomorrow/weekend from the current clock
  and the city's timezone, not permanently stored relative tags. Tonight starts at
  18:00 local. Expired windows no longer match those date filters.
- Unchanged schedules retain all slots and days. Explicit text rescheduling drops
  conflicting old day tags. Tests cover local-midnight boundaries, daylight saving,
  month/year rollover, and native draft-to-submit behavior.
- The web editor now exposes the same start/end window. A dated offer cannot be
  rescheduled by changing only its text label; UTC dates and city-local public labels
  stay in sync across web and mobile edits.
- New editor fields are migrated into existing API structs without replacing field
  IDs or deleting unrelated Builder fields.
- A structural guard prevents duplicate partner-listing panels and missing inbox
  controls when an edit is reapplied. Existing editor screens are not recreated.

Checks for this continuation:

- Website typecheck and build: passed, 85 generated routes.
- Website tests: 144 passed, 9 skipped. The additional cross-platform cases cover
  local/UTC form values and rejection of label-only edits to dated offers.
- SEO audit: 48 pages, 0 issues.
- FlutterFlow DSL tests: 5 passed.
- `flutter analyze --no-pub dsl`: no issues found. Direct `dart analyze` hit the
  Windows perf-witness shutdown error described in
  [Dart SDK issue 63343](https://github.com/dart-lang/sdk/issues/63343).
- Live edit dry-run: 0 errors, 39 warnings. Existing primary-scroll and dynamic-list
  warnings are still present; this is not a warning-free project.
- Generated runtime inspection confirms populated edit fields, integer date values,
  selected-value preservation on date-picker cancellation, and reuse of the saved ID.
- Fresh exported runtime analysis: 0 errors, 255 warnings, 1,353 informational
  diagnostics. `flutter analyze --no-pub` exits 1 for these warnings; they were not
  suppressed, and this is not a clean lint pass.
- Builder visual check at 393 x 852: editor fields, paired prices, category label,
  and improved text/icon contrast were inspected. This is not physical-device QA.

Cloud approval, real booking/email delivery, payment, and physical-device tests have
not been performed in this continuation. These checks do not imply a production or
store release.

Pages: 17

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
- `PartnerDealEditorPage`
- `AdminPage`
- `AiAssistantPage`
- `AiSupportPage`

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

Global App State: 2

- `activeCity`
- `planPersona`

The BeautyDrop pattern was adapted without copying its large global-state surface.
New list, request, editor, loading, and error state is page-local so screens remain
Builder-friendly and easier to maintain.

Integrations:

- API groups: 3 (`GoFunMotionWeb`, `GoFunMotionAssistant`, `GoFunMotionAccount`)
- API endpoints: 23
- Custom actions: 1 (`registerGoFunMotionPushToken`)
- Custom widgets: 0
- Custom functions: 1 (`goFunMotionListingReference`)

The single custom action is limited to device notification permission and FCM token
registration. All visible UI and workflow controls remain native FlutterFlow widgets
and actions.

## Implemented Product Flow

| Surface | Status | Notes |
| --- | --- | --- |
| GoFunMotion theme | Built | Cyan, pink, and lime accents with light/dark surfaces and semantic typography colors. |
| Deal-first home | Built | Compact native header; Tonight's Deals opens DealsPage. The plan finder remains a helper tab. |
| Public deal discovery | Built | Discovery, deals, deal detail, and plan finder are available before login. |
| Role-aware auth routing | Built | User, business, and admin access is resolved by the secure web API after Firebase auth. |
| Smart Search and AI Plan | Built | Calls the web AI endpoints; plan facts are constrained by supplied listings. |
| Partner Copy Assistant | Built | Produces editable title and description suggestions without changing deal facts. |
| Booking Message Assistant | Built | Drafts editable customer text and never submits a request automatically. |
| Saved plans and deals | Built | Loads and writes user-owned data through authenticated server endpoints. |
| Customer request history | Built | `SavedPage` independently loads requests and displays current status. |
| Booking request | Built | `DealDetailPage` sends a request, not a consumer payment. |
| Partner application | Built | Public application enters the approval workflow. |
| Partner deal editor | Create/edit built | Dedicated native screen with populated edit fields, was/now prices, category, spots, date/expiry pickers, draft and review submission. |
| Listing approval boundary | Built | Partner submissions go to server-enforced review; mobile UI cannot approve itself. |
| Partner listing list | Built | Partner dashboard loads the authenticated business listings. |
| Partner request inbox | Built | Business can mark requests contacted, confirmed, or cancelled. |
| Notifications registration | Built | Authenticated device tokens can be registered with the backend. |
| Admin entry screen | Built first pass | Secure role gate exists; dense operational subpages still need Builder polish. |

## API Contracts Used By FlutterFlow

The app calls `https://gofunmotion.com` through the `GoFunMotionWeb` API group:

- access and role routing
- smart search and constrained AI plan
- partner title and description assistants
- saved listings and saved plans
- booking request and booking message assistant
- customer booking history
- partner applications
- partner listings create/update/list
- partner booking inbox and status changes
- push-token registration

Firebase ID tokens are sent to protected endpoints. OpenAI, Firebase Admin, Resend,
and Stripe secrets stay server-side and are not embedded in FlutterFlow.

## BeautyDrop Adaptation

The following proven BeautyDrop workflow patterns are now adapted for activities:

- explicit loading, empty, ready, and error states
- editable AI output instead of autonomous AI actions
- customer request history with visible status
- business request inbox with constrained status transitions
- secure role-aware server calls
- compact partner editor focused on an expiring inventory slot

Beauty-specific wording, Supabase assumptions, beauty provider identifiers, and its
large App State model were intentionally not copied. GoFunMotion uses its own Firebase
project, Firestore schema, web APIs, roles, listing semantics, and visual identity.

This is adapted workflow parity, not a literal BeautyDrop clone. GoFunMotion now has
62 editable native pages, including separate onboarding, settings, notifications,
request detail, subscription, partner operations, and 18 mobile admin pages.

### Native subscription SDK boundary

- **Name/type:** `goFunMotionStoreSubscription`, narrow custom action.
- **Why native actions are insufficient:** purchase eligibility depends on the current
  Firebase UID, one approved business binding, provider-specific subscription state,
  localized store products, and a server-verified receipt result.
- **Where used:** only `PartnerSubscriptionPage`.
- **Builder-editable UI:** all plan cards, prices, messages, purchase/restore/manage
  buttons, legal copy, spacing and colors remain ordinary Builder widgets.
- **Fail-closed loading:** purchase controls remain hidden until the store action
  explicitly reports readiness and plan eligibility for the approved business.
- **Secrets:** none. The action receives an authenticated public SDK key from the
  server; RevenueCat private API and webhook keys remain in Vercel only.
- **Test/remove:** unit and emulator tests cover entitlement checks; remove the one
  action and swap the button actions if FlutterFlow exposes the same verified flow.

## Remaining Release Risks

1. FlutterFlow Builder still needs Firebase access/config files. All 23 production
   Firestore indexes are deployed and READY.
   Mobile app records, bundle IDs, signing files, and auth providers must also be
   verified in Firebase Console, Apple Developer, and Google Play Console.
   The branded square launcher source is selected in Builder, but the latest AI
   export still contains Flutter's default launcher binaries on both platforms.
2. The pushed project needs full interactive QA and physical iOS and Android tests.
   Builder visual checks do not prove auth, saving, booking, or native date-picker
   interaction. A successful DSL compile is not a store-release archive.
3. Production is behind the current preview. On 2026-08-25, unauthenticated probes to
   `/api/me/booking-requests` and `/api/ai/booking-message` returned 404 on
   `https://gofunmotion.com`. The current backend must be promoted before these mobile
   flows can work live. The local Vercel CLI is logged out.
4. Push delivery requires valid APNs/FCM configuration. Token registration alone does
   not prove device delivery.
5. The 18 dedicated mobile admin screens are built, but still require physical-device
   QA with a real administrator account and production data.
6. Consumer payments are intentionally absent. Booking remains a request until the
   partner confirms; Stripe is for partner subscriptions.

## Next Builder-First Slice

1. Connect `gofunmotion-prod` in Builder and regenerate the matching platform files.
2. Configure RevenueCat products and the authenticated Vercel webhook variables.
   The `partner_plans` default offering, `growth_monthly`/`pro_monthly` packages,
   matching products, and `growth`/`pro` entitlements now exist. App Store product
   status, the IAP credential, private server key and webhook remain release gates.
3. Visually QA subscription cancellation, pending payment, restore, account switching,
   partner deal editing and booking status updates with an approved test business.
4. Test email, Google, Apple, and browse-without-login routing
   on physical devices.
5. Build Android Internal Testing and iOS TestFlight artifacts only after fresh signed
   builds pass.

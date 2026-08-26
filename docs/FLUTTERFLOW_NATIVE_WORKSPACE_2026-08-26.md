# GoFunMotion Native Workspace Expansion

Date: 2026-08-26.
Project: `go-fun-motion-deals-vl4mj8`.
Builder: https://app.flutterflow.io/project/go-fun-motion-deals-vl4mj8

## Scope and Status

The existing project now contains **62 pages and 7 components**, up from 17 pages
and 4 components. This update adds 45 native, visually editable FlutterFlow pages.
It does not replace the project, copy BeautyDrop credentials into the app, or edit
the generated Flutter source. The original 17 screens, including the deal editor
and AI pages, are retained and connected to the new workspace.

Initial expansion commit: `u3GhT7KMJDDC0rKQ1CIC`.
Verified loading repair/export: `EKrDhycDMr5CkCvRnB3i`.
Final organized workspace/export: `jExsfCMwThaAVIG3GIyo`.

Builder publication is not website deployment or App Store distribution. The new
screens use `/api/mobile/workspace` on `https://gofunmotion.com`. Deploy the matching
backend and indexes before running a real mobile account workflow. No production
records, purchases, or customer messages were created during emulator QA.

## Added Pages

### Onboarding (4)

| Page | Purpose |
| --- | --- |
| IntroOnboardingPage | Brand introduction, browse without signup, account entry |
| RoleSelectionPage | Customer or business journey |
| CustomerOnboardingPage | Name, optional phone and canonical city selection |
| BusinessOnboardingPage | Application, approval and partner access steps |

### Customer (10)

| Page | Purpose |
| --- | --- |
| CustomerRequestsPage | Paginated own booking requests |
| CustomerRequestDetailPage | Request detail, status and explicit cancellation |
| EditProfilePage | Editable user profile and preferred city |
| AccountSettingsPage | Profile, privacy, notifications, sign-out and deletion links |
| NotificationSettingsPage | Booking push preference |
| NotificationsPage | In-app inbox and mark-read action |
| DeleteAccountPage | Explicit confirmation, recent-auth and ownership checks |
| DealsMapPage | Approved offers with supplied venue coordinates and map preview |
| ListingReviewsPage | Public approved reviews for an approved activity |
| WriteReviewPage | One moderated review for an eligible confirmed booking |

### Partner (10)

| Page | Purpose |
| --- | --- |
| PartnerInboxPage | Requests for a currently owned approved business |
| PartnerRequestDetailPage | Contact information and confirmed status action |
| PartnerListingsPage | Own offers, create entry and pagination |
| PartnerListingOverviewPage | Offer status and prefilled existing deal editor |
| PartnerBusinessProfilePage | Business profile fields |
| PartnerSettingsPage | Business workspace navigation |
| PartnerSubscriptionPage | Effective tier, limits and plan comparison |
| PartnerTeamPage | Pro-gated team contact roster |
| PartnerTeamMemberPage | Add a roster contact, not an account invitation |
| PartnerAnalyticsPage | Tier-gated real views, saves, clicks and request counts |

### Administration (18)

| Page | Purpose |
| --- | --- |
| AdminApplicationsPage | Partner application queue |
| AdminApplicationDetailPage | Registered owner lookup, approve or reject |
| AdminListingsPage | Listing moderation queue |
| AdminListingDetailPage | Approve, reject, feature and promote controls |
| AdminBusinessesPage | Business directory |
| AdminBusinessDetailPage | Business approval and suspension |
| AdminUsersPage | Account directory |
| AdminUserDetailPage | Read-only account record, no role escalation control |
| AdminCitiesPage | Canonical city directory |
| AdminCityEditorPage | Create or edit city with deduplication and timezone validation |
| AdminCategoriesPage | Category directory |
| AdminCategoryEditorPage | Create or edit category |
| AdminBookingsPage | Request overview |
| AdminBookingDetailPage | Read-only request record |
| AdminReviewsPage | Moderation queue |
| AdminReviewDetailPage | Approve, reject or hide a review |
| AdminAuditLogPage | Paginated server-written audit log |
| AdminMetricsPage | Marketplace totals from actual records |

### Support and Legal (3)

| Page | Purpose |
| --- | --- |
| SupportPage | Common booking answers, AI support and contact escalation |
| PrivacyPage | Privacy summary and full policy link |
| TermsPage | Request-not-confirmation terms and full policy link |

New shared components: `WorkspaceMenuRow`, `WorkspaceStatusBadge`,
`WorkspaceEmptyState`. Native folders group new pages by role; existing manual
folder assignments are preserved.

## Data and Authorization

- GET `/api/mobile/workspace` accepts an allowlisted section and bounded record IDs.
  Map and published reviews are public. All other sections require a Firebase ID
  token. Responses expose explicit DTO fields, not raw documents or billing secrets.
- POST uses validated, allowlisted commands. The server rechecks admin membership
  and current business ownership; stale `businessOwnerIds` on a request do not
  grant access. Business users cannot approve or feature their own listings.
- Private responses are `no-store`. Lists have bounded pagination. Native API query
  parameters use FlutterFlow encoding instead of string interpolation.
- Review eligibility requires the user's own confirmed request and a past request
  date. This is not proof of attendance. Reviews remain pending until moderation.
- Cancellation and partner status changes are transactional and idempotent. Final
  cancelled/rejected requests cannot be silently reopened. Notifications are sent
  only after a successful state change.
- Repeated application approval preserves the existing business profile, owners
  and paid tier. Reassignment or reactivation of a suspended business is rejected.
- Paid access is fail-closed when the billing period is missing or expired, even
  if a status still says `active`. Team contacts do not change `ownerIds` or grant
  dashboard access.
- Cities use normalized name/state/country identities, transactional deduplication
  and legacy-city reuse. Case differences do not create separate city entries.
- Account deletion requires authentication within five minutes and blocks admin
  and business-owner accounts pending transfer or closure. User-owned reviews are
  included in cleanup.

## Builder Maintenance

Source: `gofunmotion-ffai/dsl/expanded_workspace.dart`; entry: `dsl/edit.dart`.
New pages are authored once. Later runs update the owned load/retry actions through
generated typed handles without replacing their native widget trees. Manual
Builder layout changes remain authoritative. Never edit `generated_code/`.

The loading repair removes a conditional that previously prevented selected
businesses from loading. List-state normalization must preserve the outer
`dataStructIdentifier`; dropping it breaks list bindings and navigation. The
onboarding image references an existing hosted brand asset, not an unexported
`assets/brand` file.

## Verification

- Website typecheck, build and server-runtime checks passed.
- Regular test run: 199 passed, 17 skipped. Eight of those skipped tests are run
  separately in the dedicated emulator suite; the other legacy emulator tests
  are not claimed as verified here.
- Mobile workspace emulator integration: 8 passed with real Auth/Firestore emulators.
- All Dart tests: 22 passed. Native DSL expansion tests include 8 cases covering page inventory, private-page
  guards, pagination, destructive confirmation, struct identity and folder reuse.
- SEO audit: 48 pages, 0 issues.
- Builder spot checks confirm the new role folders and native admin/customer/
  partner pages. Fresh generated-code inspection confirms selected-business loading.
- Full generated-runtime analysis on `jExsfCMwThaAVIG3GIyo`: 0 errors, 1,057 warnings
  and 3,364 informational diagnostics. Warnings remain in the log; generated source
  was not hand-edited to suppress them. This does not establish release readiness.
- The fresh export compiled successfully for web with the already-installed
  Flutter 3.35.7 / Dart 3.9.2 runtime. `flutter build web` exited 0 and produced
  `generated_code/build/web`; the Wasm dry run also passed.
- The default Flutter 3.44.0 build failed because the exported
  `font_awesome_flutter 10.12.0` subclasses `IconData`, which is final in that
  runtime. No dependency cache or generated source was patched, and the global
  Flutter installation was not changed. The 3.35.7 build is compatibility evidence,
  not confirmation of the exact current FlutterFlow CI runtime or an iOS archive.

Repeat the compatibility build from `gofunmotion-ffai/generated_code`:

```powershell
& 'C:\Users\Administrator\development\flutter-3.35.7\bin\flutter.bat' build web
```

Builder screenshots are authoring checks, not runtime screenshots. Builder shows
conditional loading, error and access-denied widgets together on the canvas.
Role-based runtime screenshots remain pending the backend/Firebase setup below.

On this Windows host, Java 21's emulator loopback issue needs a process-local TCP
fallback. The path below must remain nonexistent:

```powershell
$path = 'C:\Projects\site-factory\output\qa\unavailable-jdk-unix'
if (Test-Path -LiteralPath $path) { throw 'Fallback path already exists' }
$env:JAVA_TOOL_OPTIONS = "-Djdk.net.unixdomain.tmpdir=$path -XX:ActiveProcessorCount=4"
npm.cmd run test:mobile-workspace
```

## Remaining Release Work

1. Deploy the protected API, indexes and existing approved-only feed together.
2. Upload/regenerate Firebase mobile configuration in FlutterFlow; verify Google,
   Apple and email on physical devices. The current generated web Firebase init
   also lacks explicit web configuration.
3. Run role-based end-to-end QA against the deployed backend, including real email
   delivery and push permissions. Emulator success does not prove provider delivery.
4. Team invitation/acceptance and scoped staff permissions are a separate feature.
   The current team screen is a contact roster only.
5. Subscriptions show real entitlements but do not initiate a native purchase or
   imply App Store billing approval. Consumer booking checkout remains disabled.
6. Map results need actual approved venue coordinates. No geocoding, distance,
   availability or review data is fabricated.
7. Produce a fresh signed iOS archive and Android internal build. This work does
   not claim TestFlight readiness.
8. Align the export dependencies with the exact FlutterFlow CI runtime before
   release. Do not solve the Flutter 3.44 failure by hand-editing generated Dart.
9. Replace or upload the legacy `SplashPage` reference to
   `assets/brand/gofunmotion-splash-motion.gif` and the native launcher/splash assets
   through FlutterFlow. The new Intro page uses a verified hosted brand image,
   but that does not repair the separate legacy startup asset configuration.

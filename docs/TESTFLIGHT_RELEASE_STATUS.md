# GoFunMotion TestFlight Release Status

## Verification Dates

- Last authenticated Apple API verification: 2026-09-06.
- Public-link and tester-device checks: 2026-09-03.
- Apple API and browser access verified. The owner signed in and the review reply
  was submitted on 2026-09-06 at 12:56 PDT; the conversation shows two messages.

This document supersedes older `No Builds`, build `2`, and missing-iOS-upload
statements in the setup and historical QA notes.

## Build 7

- Version: `1.0.0 (7)`, bundle `com.gofunmotion.app`.
- Build ID: `3cf5cf8d-fe69-4656-ba2d-ad546c3a334e`.
- FlutterFlow source includes native commit `xMUPgH4ABKLseVIpyVaE`.
- Submitted through FlutterFlow Builder; cloud build finished successfully.
- Uploaded: 2026-09-06 13:13:46 PDT. Apple processing: `VALID`.
- `usesNonExemptEncryption=false` set under the owner's existing declaration;
  no custom encryption was introduced by this patch.
- Internal state: `IN_BETA_TESTING`; auto-notify enabled. Group `Qqq` has automatic
  access to all builds. An explicit API assignment returned 422 because internal
  groups are not assigned that way; subsequent state confirmed internal testing.
- Assigned to external group `GoFunMotion Early Access` and submitted for beta
  review on 2026-09-06. Submission state: `WAITING_FOR_REVIEW`.
- Updated the English What to Test instructions for auth returns, saved loading,
  scroll behavior, demo-map navigation and sandbox-only purchase/restore QA.
- Expires: 2026-12-05 12:13:46 PST.

Build 7 is not externally approved or physically device-tested by this pass.
Do not tell external testers the public join link is installable yet.

## Build 6

- App: `GoFunMotion Deals`, Apple app ID `6805635040`.
- Bundle ID: `com.gofunmotion.app`.
- Version: `1.0.0 (6)`.
- Build ID: `ade65d09-f7d7-444a-bec5-61ec693a2a33`.
- Uploaded: 2026-09-01 17:40 PDT.
- Apple processing: `VALID`, verified 2026-09-06.
- Internal testing: `IN_BETA_TESTING`, verified 2026-09-06.
- External beta review: `REJECTED`; external build state `BETA_REJECTED`, verified
  2026-09-06. Apple requested review sign-in details under Guideline 2.1(a).
- `usesNonExemptEncryption=false` was set after the owner's explicit confirmation.
- Build expires: 2026-11-30 16:40 PST.

The failed build `5` was rejected for an app-icon alpha channel. The launcher was
reuploaded through FlutterFlow Builder and the build number increased to `6`.
FlutterFlow publishing succeeded and Apple's processed icon was visually verified
as the GoFunMotion brand. Do not rebuild or reset the build number merely because
an older publishing log still shows the build `5` failure.

## Tester Access

External group: `GoFunMotion Early Access`
(`65fd74c9-ec84-454d-8c4b-0fda72767275`).

Public link: <https://testflight.apple.com/join/yTeBEm32>.

On 2026-09-03 the public page says: "This beta isn't accepting any new testers
right now." The authenticated API now confirms external beta rejection. A valid
uploaded build and internal testing do not mean external testers can install it.

Last authenticated group/tester observations, 2026-09-06:

- `artagal@gmail.com`: `INSTALLED` tester state in the internal group. The last
  device observation on September 3 was build 6 on an iPhone 16e, iOS 26.5;
  installation of build 7 has not been verified.
- `decadationllc@gmail.com`: `NOT_INVITED` in the external group; build 7 is waiting
  for review. Send the invitation once an externally approved build is available.
- Internal group `Qqq` also contains `decodationllc@gmail.com` with `INVITED` state.
  This is a different spelling from the requested address. Do not silently change
  Apple team access, delete that account, or treat it as the requested tester.

Remaining distribution steps:

1. Check build `7` and its beta-review submission for approval or reviewer feedback.
2. Confirm build `7` is available to the external group after approval.
3. Send or resend the invitation to the exact requested external email
   `decadationllc@gmail.com`, then verify the resulting invitation state.
4. Verify the public link offers installation before describing it as available.
5. Check installation and key workflows on an actual iPhone. Upload and review
   success are not evidence that every in-app feature works.

## Review Sign-In Remediation

On 2026-09-03, a dedicated customer review account was created and its credentials
were saved directly in TestFlight Beta App Review Information. Never copy its
password into this repository, chat, screenshots, or logs. On 2026-09-06, the saved
credentials were retrieved privately through the Apple API and verified against
the production Firebase email/password endpoint. The saved plan, saved-listings,
booking-request, profile, and notification reads returned HTTP 200. Admin and
partner inbox requests returned HTTP 403, as expected for this customer account.

On September 6 the review reply was sent in the App Store Connect conversation
for build 6. It explicitly describes customer-only access and asks Apple which
role-specific screens need isolated review access. Build 7 was then submitted for
review with the protected sign-in fields retained. The existing sample plan was
updated through the production plan/save APIs so it uses the corrected free-plan
content; no real customer's records were changed.

This account does not provide partner/admin access or prove native purchases,
delivery, or all-role device behavior. Successful re-review remains pending.
Do not describe this remediation as external beta approval.

## Launcher Source And Export Caveat

Verified opaque launcher:
`gofunmotion-ffai/assets/brand/gofunmotion-launcher-rgb-1024.png`.

- Dimensions: `1024 x 1024`.
- PNG color type: `2` (RGB, no alpha channel).
- SHA-256: `ED249AA0672E28A7E1DAD88996B0FCB2F5A2D591BEB9360DA8EB2A88591F3CF3`.
- The existing `gofunmotion-app-icon-1024.png` currently has the same bytes/hash.

The FlutterFlow AI codegen snapshot can omit uploaded media. The current snapshot
references `assets/images/app_launcher_icon.png` but does not contain that file,
and its native icon catalogs contain placeholder Flutter icons. This does not
invalidate the separately verified Builder/cloud-build icon. Do not hand-edit
`generated_code`, replace correct Builder assets, or repeatedly upload a new build
based on that incomplete snapshot alone.

`scripts/check-mobile-release.ps1` was run on 2026-09-03. Eleven checks passed,
including Firebase identities, Google callback, Apple entitlement, canonical
profile sync, AI JSON escaping, provider-secret scan and native subscription code.
Three asset checks failed: branded iOS icon, missing launcher source, and branded
Android icon. The overall static check remains failed, not a release pass.
Use a full artifact containing media for export/asset verification, and separately
verify the signed cloud artifact. No tests of device auth, purchases or booking
delivery were performed by these static checks.

## Remaining Release Gates

- Obtain successful external re-review, address any role-specific access request, and
  verify the exact requested tester's access and public installation link.
- Physical-device QA for Apple/Google/email auth, saved items, booking requests,
  native subscription purchase/restore and account deletion.
- App Store privacy answers, required screenshots and subscription metadata.
- Full App Store release approval is separate from TestFlight beta review.

No new build or App Store production submission was triggered on 2026-09-03.

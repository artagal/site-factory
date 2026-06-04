# GoFunMotion App Store Connect Setup

Last updated: 2026-06-04.

## Current Status

- App Store Connect account was checked through the connector: no GoFunMotion app record exists yet.
- Existing apps were checked for `com.gofunmotion.app` and `com.gofunmotion.deals`: neither appears in the App Store Connect app list.
- Chrome opened `https://appstoreconnect.apple.com/apps`, but Apple redirected to `https://appstoreconnect.apple.com/login?targetUrl=%2Fapps&authResult=FAILED`. App creation still requires Apple login and any 2FA/account confirmation in Chrome.
- The App Store Connect connector can manage existing app versions, localizations, beta groups, and TestFlight metadata, but it does not expose a create-new-app tool.
- Do not submit the app for review until the FlutterFlow build is uploaded, Firebase auth is verified on device/TestFlight, screenshots are added, and App Privacy is completed.

## Production Identifiers

Use these values for the Apple Developer, Firebase, FlutterFlow, and App Store Connect setup.

| Field | Value |
| --- | --- |
| App display name | `GoFunMotion` |
| Product family | `GoFunMotion Deals` |
| Recommended iOS Bundle ID | `com.gofunmotion.app` |
| Alternate Bundle ID if Apple rejects the first | `com.gofunmotion.deals` |
| App Store Connect SKU | `gofunmotion-ios` |
| Primary language | `English (U.S.)` / `en-US` |
| Initial App Store version | `1.0` |
| FlutterFlow app version | `1.0.0` |
| FlutterFlow build number | `1` |
| Primary category | `LIFESTYLE` |
| Secondary category | `ENTERTAINMENT` |
| Copyright | `© 2026 GoFunMotion` |
| Marketing URL | `https://gofunmotion.com` |
| Support URL | `https://gofunmotion.com/support` |
| Privacy Policy URL | `https://gofunmotion.com/privacy` |
| Terms URL | `https://gofunmotion.com/terms` |

The generated FlutterFlow export still shows the placeholder `com.mycompany.gofunmotiondeals`. Do not ship that identifier. Set the production Bundle ID in FlutterFlow Builder settings and in Apple Developer before exporting the release build.

## Apple Developer Bundle ID

Create the Bundle ID before creating the App Store Connect app record:

1. Open Apple Developer > Certificates, Identifiers & Profiles > Identifiers.
2. Click `+`.
3. Select `App IDs`.
4. Select `App`.
5. Description: `GoFunMotion`.
6. Bundle ID type: `Explicit`.
7. Bundle ID: `com.gofunmotion.app`.
8. Enable capabilities:
   - `Sign in with Apple`
   - `Push Notifications`
   - `Associated Domains`
9. Leave these disabled for MVP unless intentionally added later:
   - `Apple Pay`
   - `In-App Purchase`
   - `Game Center`
10. Save the identifier.

If Apple says the Bundle ID is unavailable, use `com.gofunmotion.deals` and update Firebase, FlutterFlow, and App Store Connect consistently.

## Firebase iOS App

In Firebase project `gofunmotion-prod`:

1. Add an iOS app with Bundle ID `com.gofunmotion.app`.
2. App nickname: `GoFunMotion iOS`.
3. Download the new `GoogleService-Info.plist`.
4. Upload the plist into FlutterFlow Firebase settings.
5. Enable or verify Firebase Auth providers:
   - Email/password
   - Google
   - Apple
6. Add the Apple provider configuration after the Apple Service ID/key setup is complete.
7. Verify Firestore rules/indexes are deployed before using production data.

Do not commit `GoogleService-Info.plist` or Apple private keys unless the repository policy explicitly allows sanitized/mobile config files. Never commit App Store Connect `.p8` private keys.

## FlutterFlow Mobile Deployment

FlutterFlow project:

- Project: `GoFunMotion Deals`
- Project ID: `go-fun-motion-deals-vl4mj8`
- URL: `https://app.flutterflow.io/project/go-fun-motion-deals-vl4mj8`

Set these in FlutterFlow Builder:

| FlutterFlow field | Value |
| --- | --- |
| App Display Name | `GoFunMotion` |
| iOS Bundle ID | `com.gofunmotion.app` |
| Android Package Name | `com.gofunmotion.app` |
| App Version / Version Name | `1.0.0` |
| Build Number / Version Code | `1` |
| App Icon | `gofunmotion-ffai/assets/brand/gofunmotion-app-icon-1024.png` |
| Splash Image | `gofunmotion-ffai/assets/brand/gofunmotion-splash.png` |
| Animated splash page asset | `gofunmotion-ffai/assets/brand/gofunmotion-splash-motion.gif` |

FlutterFlow App Store deployment fields:

| Field | Value / Source |
| --- | --- |
| Issuer ID | App Store Connect > Users and Access > Integrations > App Store Connect API |
| Key ID | The generated App Store Connect API key ID |
| Private Key | Upload the downloaded `.p8` key file |
| App ID | The numeric App Store Connect app ID after the app record is created |

The numeric App ID is visible in the App Store Connect URL after creation, for example:

```text
https://appstoreconnect.apple.com/apps/1234567890/appstore
```

In that example, `1234567890` is the FlutterFlow `App ID`.

## Create App Store Connect App Record

After Apple login is active in Chrome:

1. Open `https://appstoreconnect.apple.com/apps`.
2. Click `+`.
3. Click `New App`.
4. Platform: `iOS`.
5. Name: `GoFunMotion`.
6. Primary Language: `English (U.S.)`.
7. Bundle ID: select `com.gofunmotion.app`.
8. SKU: `gofunmotion-ios`.
9. User Access: `Full Access`.
10. Click `Create`.
11. Copy the numeric App ID from the URL and paste it into FlutterFlow App Store deployment settings.

## App Information

Set categories after the app record exists:

- Primary category: `Lifestyle`
- Secondary category: `Entertainment`

Age rating guidance:

- No gambling.
- No unrestricted web access as a primary feature.
- No user-generated content for MVP unless partner/customer reviews are publicly shown before moderation.
- If public reviews or partner-submitted content are enabled, moderation/reporting controls must be described accurately.

## Version 1.0 App Store Metadata

Use this as the first `en-US` App Store version localization.

App name:

```text
GoFunMotion
```

Subtitle:

```text
Find fun deals today
```

Promotional text:

```text
Find last-minute local activity deals for date nights, family outings, friends, classes, shows, and experiences.
```

Description:

```text
GoFunMotion helps you find something fun to do today.

Discover local activity deals, open spots, and last-minute experiences for date nights, friends, family plans, classes, shows, workshops, and more. Browse deals by city, time, budget, and vibe, then save your favorites or request availability from participating partners.

For customers:
- Find local activities without searching across multiple tabs.
- Compare clear activity details, timing, and deal information.
- Save plans and deals for later.
- Send request-based booking inquiries when a listing is available.

For partners:
- Share last-minute openings, slow-time deals, and activity availability.
- Receive booking requests.
- Manage listings through partner tools after approval.

GoFunMotion is a lightweight discovery and request marketplace. It is not a full ticketing platform, and consumer checkout is not enabled in the MVP.
```

Keywords, 100 characters max:

```text
activities,deals,date night,family fun,local events,last minute,things to do
```

What's New:

```text
Initial GoFunMotion release for discovering local activity deals, saving plans, and requesting availability.
```

Support URL:

```text
https://gofunmotion.com/support
```

Marketing URL:

```text
https://gofunmotion.com
```

Privacy Policy URL:

```text
https://gofunmotion.com/privacy
```

## TestFlight Metadata

Beta description:

```text
GoFunMotion is a local activity discovery app for finding last-minute fun deals, saving plans, and requesting availability from participating partners.
```

What to test:

```text
Please test discovery, filters, saved plans/deals, login, booking request submission, partner application flow, profile/settings, light and dark mode, and any Firebase auth provider available in the build.
```

Feedback email:

```text
hello@gofunmotion.com
```

Internal beta group:

```text
GoFunMotion Internal QA
```

External beta group, only after internal QA passes:

```text
GoFunMotion Beta Testers
```

## App Privacy Draft

Complete App Privacy in App Store Connect before review. Verify this against the final build behavior.

Expected data categories for the MVP:

- Contact Info: email address, name, phone number if submitted in booking/profile forms.
- Identifiers: Firebase user ID and device identifiers used by Firebase/FCM.
- User Content: booking request messages, partner listing/application content, reviews if enabled.
- Usage Data: lightweight product analytics if enabled.
- Diagnostics: crash/performance diagnostics if Firebase Crashlytics or similar is enabled.

Expected purposes:

- App functionality.
- Account management.
- Customer support.
- Analytics only if analytics is enabled.

Do not claim no data is collected if Firebase Auth, saved items, booking requests, or partner applications are enabled.

## Screenshots And Assets

Use current generated assets:

- App icon: `gofunmotion-ffai/assets/brand/gofunmotion-app-icon-1024.png`
- Static splash: `gofunmotion-ffai/assets/brand/gofunmotion-splash.png`
- Animated splash GIF: `gofunmotion-ffai/assets/brand/gofunmotion-splash-motion.gif`
- Web support page: `https://gofunmotion.com/support`

Required iOS screenshots are uploaded in App Store Connect after a TestFlight/App Store build exists. Capture screenshots from the FlutterFlow iOS build, not the Next.js website.

Suggested first screenshots:

1. Discovery / Find My Plan.
2. Deals list with category chips.
3. Drop/deal detail.
4. Booking request flow.
5. Saved plans/deals.
6. Partner dashboard or partner apply, if partner tools are in the app build.

## Hard Blockers Before Review Submission

- Apple Developer Bundle ID `com.gofunmotion.app` is created.
- App Store Connect app record exists and numeric App ID is pasted into FlutterFlow.
- FlutterFlow iOS bundle ID no longer uses `com.mycompany.gofunmotiondeals`.
- Firebase iOS app with matching Bundle ID is configured.
- Apple/Google/email auth are verified on a physical iOS device or TestFlight.
- A valid build is uploaded and processed in App Store Connect.
- App Privacy is completed.
- Screenshots are uploaded.
- Support URL, privacy URL, and terms URL return `200`.
- No checkout/payment claims appear unless payments are actually implemented and reviewed.
- Review submission is triggered only after explicit approval.

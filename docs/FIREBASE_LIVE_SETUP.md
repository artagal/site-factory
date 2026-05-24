# GoFunMotion Firebase Live Setup

This repo is Firebase-ready, but real cloud sync requires a Firebase project, enabled auth providers, Firestore, and matching Vercel environment variables.

## Local CLI

Use the repo-local Firebase CLI:

```powershell
npm.cmd run firebase:login
npm.cmd run firebase:login:list
```

If the Codex shell is non-interactive, run the same command in a normal Windows terminal.

## Create Firebase Project

Recommended project naming:

```powershell
npm.cmd exec -- firebase projects:create gofunmotion-prod --display-name "GoFunMotion"
```

If that project ID is taken, use a unique suffix:

```powershell
npm.cmd exec -- firebase projects:create gofunmotion-prod-001 --display-name "GoFunMotion"
```

Then create `.firebaserc` from `.firebaserc.example`:

```json
{
  "projects": {
    "default": "YOUR_FIREBASE_PROJECT_ID"
  }
}
```

## Create Web App

```powershell
npm.cmd exec -- firebase apps:create WEB "GoFunMotion Web" --project YOUR_FIREBASE_PROJECT_ID
npm.cmd exec -- firebase apps:list --project YOUR_FIREBASE_PROJECT_ID
npm.cmd exec -- firebase apps:sdkconfig WEB YOUR_FIREBASE_APP_ID --project YOUR_FIREBASE_PROJECT_ID
```

Copy the SDK config values into:

```text
apps/website/.env.local
```

Required variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Do not commit `.env.local`.

## Enable Auth Providers

In Firebase Console:

1. Open Authentication.
2. Click Get started.
3. Enable Anonymous.
4. Enable Google.
5. Enable Email/password.
6. Add the production domain to authorized domains:
   - `gofunmotion.com`
   - the active Vercel deployment domain

## Create Firestore

In Firebase Console:

1. Open Firestore Database.
2. Create database.
3. Start in production mode.
4. Pick the closest region to the primary audience.

Optional seed document for the daily mission:

```text
dailyChallenges/2026-05-23
```

Example fields:

```json
{
  "acceptedCount": 1284,
  "category": "Mind Reset",
  "completedCount": 719,
  "date": "2026-05-23",
  "description": "Step outside for 10 minutes before sunset. Take one photo. Do not post it immediately. Just enjoy it first.",
  "difficulty": "easy",
  "id": "daily-sunset-reset",
  "intensity": "low",
  "locationType": ["outside", "anywhere"],
  "moodTags": ["tired", "bored", "anxious"],
  "rarity": "Rare",
  "safetyNote": "Choose a safe public or private place. Do not look at the sun directly.",
  "timeEstimateMinutes": 10,
  "title": "Today's Mission: Sunset Reset",
  "whyItHelps": "Pausing before posting turns a digital impulse into an actual memory.",
  "xpReward": 50
}
```

Optional weekly leaderboard structure:

```text
leaderboards/2026-W21
leaderboards/2026-W21/entries/{userId}
categoryLeaderboards/{category}/periods/2026-W21/entries/{userId}
```

Recommended `leaderboards/{periodId}` fields:

```json
{
  "mode": "live",
  "periodId": "2026-W21",
  "updatedAt": "2026-05-23T12:00:00.000Z",
  "communityStats": [
    { "label": "weekly XP earned", "value": "18420" },
    { "label": "missions completed", "value": "1284" },
    { "label": "active streaks", "value": "231" }
  ],
  "weeklyXpLeaders": [],
  "streakLeaders": [],
  "categoryLeaders": []
}
```

Leaderboard writes are blocked from the public client. Later, a Cloud Function should rebuild weekly XP, streak leaders, category leaders, and completed challenge counts from trusted completion events.

## Deploy Rules and Indexes

```powershell
npm.cmd run firebase:deploy:firestore
```

This deploys:

```text
firestore.rules
firestore.indexes.json
```

## Add Vercel Environment Variables

Use the Vercel dashboard or CLI:

```powershell
npx.cmd vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
npx.cmd vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
npx.cmd vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
npx.cmd vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
npx.cmd vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
npx.cmd vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
```

Repeat for `preview` if needed.

## Add Firebase Admin Environment Variable

Production-only server routes need Firebase Admin credentials for trusted backend writes:

```text
/api/events
/api/waitlist
/api/account/delete
/api/admin/rebuild-leaderboard
```

Create a Firebase service account in Firebase Console:

1. Project settings.
2. Service accounts.
3. Generate new private key.
4. Base64-encode the JSON file locally.
5. Add the encoded value to Vercel as:

```env
FIREBASE_SERVICE_ACCOUNT_JSON=
GOFUNMOTION_ADMIN_CRON_SECRET=
```

PowerShell base64 helper:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\service-account.json"))
```

Do not expose this value in client code. Do not commit it. After adding the Vercel env var, redeploy production.

`GOFUNMOTION_ADMIN_CRON_SECRET` protects the server leaderboard rebuild route. Call it only from a trusted environment:

```powershell
Invoke-WebRequest -Method Post `
  -Uri https://gofunmotion.com/api/admin/rebuild-leaderboard `
  -Headers @{ "x-admin-secret" = "YOUR_SECRET" }
```

If Admin credentials are missing:

- Challenge generation still works.
- Local progress still works.
- Firebase client profile sync still works after login.
- Server-side global stats, server waitlist writes, leaderboard rebuild, and account deletion return safe fallback behavior instead of crashing.

## Verification Checklist

1. Run locally:

```powershell
npm.cmd run typecheck
npm.cmd run build
```

2. Start local dev:

```powershell
npm.cmd run dev -- --port 3004 --hostname 127.0.0.1
```

3. Verify:
   - `/login` shows Firebase configured.
   - Google login works.
   - Anonymous login works.
   - Email/password signup works.
   - Generate a challenge.
   - Save the challenge.
   - Complete the challenge.
   - Open `/profile` and confirm XP, streak, badges, saved missions, and recent activity update.
   - Test on another browser/device after Google login to confirm cloud sync.
   - Open `/profile/settings`.
   - Update display name and confirm `/profile` reflects it.
   - Send verification email for email/password accounts.
   - Sign out and confirm the browser returns to guest progress.
   - For a disposable test account only, type `DELETE` and test account deletion.

## Notes

Global stats writes are blocked from the public client by Firestore rules. They are now routed through server-side Vercel API routes when `FIREBASE_SERVICE_ACCOUNT_JSON` is configured. A future Cloud Function can replace these server routes if the backend moves fully into Firebase.

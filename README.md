# GoFunMotion

GoFunMotion is an AI-ready real-life challenges web service for `gofunmotion.com`.

Positioning: **The internet that gets you moving.**

The site includes a premium marketing homepage, interactive challenge generator, daily challenge, categories, profile progress, leaderboard preview, waitlist, blog, privacy, and terms pages.

## Tech

- Next.js / React
- TypeScript
- Tailwind CSS
- Framer Motion
- Firebase-ready architecture
- LocalStorage fallback for immediate use
- Vercel-ready deployment

## Run Locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`.

## Useful Commands

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd test
npm.cmd run sitemap:generate
npm.cmd run robots:generate
```

## Firebase Environment Variables

Firebase is optional. Without these values, the app still works locally with localStorage.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Copy `apps/website/.env.example` to `apps/website/.env.local` for local Firebase testing. Do not commit `.env.local`.

Production server routes also support Firebase Admin for trusted writes:

```env
FIREBASE_SERVICE_ACCOUNT_JSON=
GOFUNMOTION_ADMIN_CRON_SECRET=
```

Use a base64-encoded Firebase service account JSON value in Vercel. If this is missing, the site still works, but `/api/events`, `/api/waitlist`, `/api/account/delete`, and `/api/admin/rebuild-leaderboard` cannot perform trusted Firestore/Auth admin writes.

Firebase project files are included:

- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `.firebaserc.example`

Connect a live project after Firebase CLI login:

```powershell
npm.cmd exec --yes --package firebase-tools@13.35.1 -- firebase login
Copy-Item .firebaserc.example .firebaserc
# Replace YOUR_FIREBASE_PROJECT_ID in .firebaserc
npm.cmd exec --yes --package firebase-tools@13.35.1 -- firebase deploy --only firestore:rules,firestore:indexes
```

Auth providers to enable in Firebase Console:

- Anonymous
- Google
- Email/password

Production account controls now include profile display-name updates, email verification for email/password accounts, sign out, and server-side account deletion through `/profile/settings`.

## Vercel Notes

- Framework: Next.js
- Build command: `npm run build`
- Output directory: `.next` when the Vercel root is `apps/website`
- Do not expose server-side AI keys in client code.
- `/api/generate-challenge` currently uses local templates and is ready for a secure AI provider later.
- Server routes use best-effort per-instance rate limits. For high traffic, replace the in-memory limiter with a shared store such as Redis or a Firebase-backed throttle.

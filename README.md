# GoFunMotion

GoFunMotion is being pivoted into **GoFunMotion Deals**, a local discovery and activity deals app for `gofunmotion.com`.

Main promise: **Find something fun to do today.**

The current repo contains a Next.js web prototype in `apps/website`. Future FlutterFlow app work must stay Builder-first: use native FlutterFlow widgets, components, backend queries, native actions, conditional visibility, Page State, Component State, and Page Parameters before custom code.

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
```

Use a base64-encoded Firebase service account JSON value in Vercel. If this is missing, the site still works for public browsing and local demo content, but trusted routes such as booking requests, partner applications, waitlist sync, admin approval tools, account deletion, and partner dashboard writes cannot perform live Firestore/Auth admin operations.

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
- Apple
- Email/password

## FlutterFlow Builder-First Docs

Read these before any FlutterFlow implementation:

- `docs/FLUTTERFLOW_BUILDER_FIRST_PLAN.md`
- `docs/FLUTTERFLOW_CUSTOM_CODE_POLICY.md`
- `docs/FLUTTERFLOW_APP_STATE_POLICY.md`
- `docs/FLUTTERFLOW_BUILDER_FRIENDLY_AUDIT.md`

FlutterFlow app:

- Project: `GoFunMotion Deals`
- Project ID: `go-fun-motion-deals-vl4mj8`
- URL: `https://app.flutterflow.io/project/go-fun-motion-deals-vl4mj8`
- Local workspace: `gofunmotion-ffai`
- Main DSL: `gofunmotion-ffai/dsl/create.dart`

Before future FlutterFlow edits, run a fresh project inspection from `gofunmotion-ffai`, update the audit if the live project changed, and treat manual Builder edits as source of truth.

Do not rerun `gofunmotion-ffai/dsl/create.dart` against the bound live project; use `dsl/edit.dart` or Builder-native manual edits for follow-up changes.

Production account controls now include profile display-name updates, email verification for email/password accounts, sign out, and server-side account deletion through `/profile/settings`.

## Vercel Notes

- Framework: Next.js
- Build command: `npm run build`
- Output directory: `.next` when the Vercel root is `apps/website`
- Do not expose server-side AI keys in client code.
- `/api/plan` uses local rules and approved listing data. Do not add OpenAI, Gemini, Google Places, Ticketmaster, Eventbrite, Stripe, or paid APIs until the marketplace is validated.
- Payment checkout is intentionally not implemented. Keep booking requests request-based until fulfillment, refund, confirmation, tax, and support policies are ready.
- Server routes use best-effort per-instance rate limits. For high traffic, replace the in-memory limiter with a shared store such as Redis or a Firebase-backed throttle.

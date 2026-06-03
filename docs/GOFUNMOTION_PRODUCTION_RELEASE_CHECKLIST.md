# GoFunMotion Production Release Checklist

Use this checklist for the GoFunMotion Deals website launch on Vercel with Firebase-backed auth, Firestore, partner tools, booking requests, and admin moderation.

## Release Scope

- Product: GoFunMotion Deals.
- Production domain: `https://gofunmotion.com`.
- Firebase project: `gofunmotion-prod` from `.firebaserc`.
- Public launch routes: `/`, `/find`, `/deals`, `/date-night`, `/friends`, `/family`, `/partner`, `/partner/apply`, `/pricing`, `/waitlist`, `/about`, `/blog`, `/privacy`, `/terms`, deal detail pages, city pages, and category detail pages.
- No public checkout in this release. Payments, Stripe, RevenueCat, PayPal, Square, partner payouts, and consumer booking checkout must stay disabled.
- Protected or account surfaces must stay out of the sitemap and render `noindex`: `/login`, `/saved`, `/profile`, `/admin`, and `/partner/dashboard`.

## Local Release Gates

Run from the repo root:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd test
npm.cmd run seo:audit
npm.cmd run build
```

Expected results:

- `seo:audit` reports `47 pages with 0 issues`.
- `build` regenerates `apps/website/public/sitemap.xml` and `apps/website/public/robots.txt`.
- `sitemap.xml` has 42 indexable routes and excludes `/challenge`, `/daily`, `/leaderboard`, `/categories`, `/login`, `/profile`, `/saved`, `/admin`, and `/partner/dashboard`.

Run local smoke after starting the dev server:

```powershell
npm.cmd run dev
npm.cmd run launch:smoke -- --base-url http://localhost:3001 --skip-env
```

Use the actual local port shown by Next.js. If port `3000` is available, replace `3001` with `3000`. The smoke script also honors `LAUNCH_BASE_URL` and `PLAYWRIGHT_BASE_URL`, so it can share the same target as the Playwright E2E config.

## Vercel Project Settings

Recommended Vercel setup for this repo:

- Root Directory: repository root.
- Framework Preset: `Next.js`.
- Install Command: `npm install`.
- Build Command: `npm run build`.
- Output Directory: `apps/website/.next`.
- Production Branch: the intended launch branch only.
- Production Domain: `gofunmotion.com`.

The root `vercel.json` is aligned to this setup. If Vercel is instead configured with Root Directory `apps/website`, then the root `prebuild` script will not run automatically. In that case, make sure sitemap and robots files are generated before deploying or move equivalent generation into the website workspace build.

## Vercel Env Var Audit

Never commit real env files. Use the Vercel dashboard or CLI.

Production audit commands:

```powershell
npx.cmd vercel env ls production
npx.cmd vercel env pull apps/website/.env.production.local --environment=production --yes
npm.cmd run launch:smoke -- --base-url https://gofunmotion.com --strict-env --env-file apps/website/.env.production.local
```

Preview audit commands:

```powershell
npx.cmd vercel env ls preview
npx.cmd vercel env pull apps/website/.env.preview.local --environment=preview --yes
npm.cmd run launch:smoke -- --base-url https://YOUR_PREVIEW_URL --env-file apps/website/.env.preview.local
```

Required for launch:

| Variable | Vercel scope | Purpose |
| --- | --- | --- |
| `SITE_FACTORY_BASE_URL=https://gofunmotion.com` | Production, preview | Canonical metadata and sitemap base URL. |
| `NEXT_PUBLIC_SITE_URL=https://gofunmotion.com` | Production, preview | Email and app-facing absolute links. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Production, preview | Firebase client initialization. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Production, preview | Firebase Auth domain. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Production, preview | Firebase client project ID. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Production, preview | Firebase client config. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Production, preview | Firebase client config. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Production, preview | Firebase client app ID. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Production, preview | Preferred Firebase Admin credential for Vercel API routes. |

Allowed Firebase Admin fallback if `FIREBASE_SERVICE_ACCOUNT_JSON` is not used:

| Variable | Vercel scope | Purpose |
| --- | --- | --- |
| `FIREBASE_PROJECT_ID` | Production, preview | Firebase Admin project ID. |
| `FIREBASE_CLIENT_EMAIL` | Production, preview | Firebase Admin service account email. |
| `FIREBASE_PRIVATE_KEY` | Production, preview | Firebase Admin private key with newline escaping preserved. |

Recommended before real booking request notifications:

| Variable | Vercel scope | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | Production, preview | Transactional email provider. |
| `EMAIL_FROM` | Production, preview | Sender, for example `GoFunMotion <notifications@gofunmotion.com>`. |
| `EMAIL_REPLY_TO` | Production, preview | Optional reply-to. |
| `BOOKING_REQUEST_FALLBACK_EMAIL` | Production, preview | Optional fallback if a real partner listing lacks business email. |
| `INTERNAL_NOTIFICATIONS_EMAIL` | Production, preview | Optional internal fallback. |

Optional:

| Variable | Scope | Purpose |
| --- | --- | --- |
| `SITE_FACTORY_LASTMOD` | Build | Deterministic sitemap `lastmod` timestamp. |
| `GOFUNMOTION_ALLOW_DEMO_SEED=true` | Local/manual only | Allows the demo Firestore seed script. Do not keep enabled in Vercel. |

Must be absent for this validation launch:

- `STRIPE_*`
- `NEXT_PUBLIC_STRIPE_*`
- `REVENUECAT_*`
- `PAYPAL_*`
- `SQUARE_*`

After adding, removing, or rotating Vercel environment variables, redeploy production. Existing Vercel deployments do not automatically receive changed env values.

## Firebase Release Checklist

Confirm project targeting:

```powershell
npm.cmd run firebase:login:list
npm.cmd run firebase:use
```

Expected default project:

```text
gofunmotion-prod
```

Console checks:

- Authentication is enabled.
- Email/password provider is enabled.
- Google provider is enabled.
- Apple provider is enabled.
- Anonymous provider is enabled if guest browsing/saves use it.
- Authorized domains include `gofunmotion.com`, `www.gofunmotion.com` if used, and the active Vercel deployment domain.
- Firestore Database exists in production mode.
- Admin users are explicitly created in `admins/{uid}` before using `/admin`.

Deploy Firestore rules and indexes only after local tests pass:

```powershell
npm.cmd run firebase:deploy:firestore
```

Do not delete production collections during release. Partner-created listings should remain `approvalStatus: "pending"` until an admin approves them. Public listing reads must stay limited to `status == "published"` and `approvalStatus == "approved"`.

Optional data prep:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_JSON="..."
$env:GOFUNMOTION_ALLOW_DEMO_SEED="true"
npm.cmd run firestore:seed-demo
```

Use demo seeding only for controlled launch validation. Do not present demo businesses as production partners.

## Preview Deployment

Create or inspect a preview before production:

```powershell
npx.cmd vercel deploy
npx.cmd vercel inspect https://YOUR_PREVIEW_URL
npm.cmd run launch:smoke -- --base-url https://YOUR_PREVIEW_URL --canonical-base-url https://gofunmotion.com --env-file apps/website/.env.preview.local
```

Preview acceptance:

- Home, plan finder, deals, pricing, partner apply, blog, and deal detail pages return `200`.
- Canonical URLs point to `https://gofunmotion.com`.
- OG image points to `https://gofunmotion.com/og/gofunmotion-og.png`.
- Login, saved, profile, admin, and partner dashboard render `noindex`.
- Sitemap and robots are available.
- `/api/plan` and `/api/search` return usable data.
- Deprecated routes redirect: `/challenge` to `/find`, `/daily` to `/find?when=today`, `/leaderboard` to `/deals`.
- `/api/checkout/partner-subscription` returns `404`.

## Production Deploy

Preferred path after a validated preview:

```powershell
npx.cmd vercel promote https://YOUR_PREVIEW_URL
```

Direct production deploy path:

```powershell
npx.cmd vercel deploy --prod
```

Post-deploy smoke:

```powershell
npm.cmd run launch:smoke -- --base-url https://gofunmotion.com --strict-env --env-file apps/website/.env.production.local
```

Then manually verify:

- Firebase Auth Google, Apple, and email sign-in work on the production domain.
- A signed-in user can save a plan and a deal.
- A signed-in user can create a booking request.
- A partner can submit an application.
- Partner-created listings are pending until admin approval.
- Admin moderation can approve/reject a listing or partner application.
- Account deletion works for a test account.
- No payment checkout appears or accepts traffic.

## Rollback Notes

Vercel rollback:

```powershell
npx.cmd vercel ls
npx.cmd vercel inspect https://BAD_DEPLOYMENT_URL
npx.cmd vercel rollback
```

Rollback to a specific deployment:

```powershell
npx.cmd vercel rollback https://LAST_GOOD_DEPLOYMENT_URL
```

If production was promoted from preview, promote the last known good preview/deployment instead of rebuilding.

Git rollback alternative:

```powershell
git log --oneline -n 10
git revert <bad_commit_sha>
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npx.cmd vercel deploy --prod
```

Firebase rollback:

- Do not delete production data as a rollback step.
- Restore last known good `firestore.rules` and `firestore.indexes.json` from Git.
- Run `npm.cmd run firebase:deploy:firestore`.
- If an auth provider setting caused the incident, revert it in Firebase Console and retest login.
- If a service account or Vercel env var was rotated incorrectly, restore the previous value in Vercel and redeploy production.

Operational rollback decision:

- If only UI/SEO is broken, use Vercel rollback first.
- If writes are failing because Firebase Admin env is missing, restore env and redeploy before changing rules.
- If public reads expose unapproved listings, deploy the last known good Firestore rules immediately.
- If a new feature writes bad data, disable the route/UI via Vercel rollback, then clean data manually after preserving evidence.

## Final Smoke Script

Script:

```powershell
npm.cmd run launch:smoke -- --help
```

Useful modes:

```powershell
# Local route smoke without requiring local production secrets.
npm.cmd run launch:smoke -- --base-url http://localhost:3001 --skip-env

# Preview smoke with canonical URLs still expected to point at production.
npm.cmd run launch:smoke -- --base-url https://YOUR_PREVIEW_URL --canonical-base-url https://gofunmotion.com --env-file apps/website/.env.preview.local

# Production smoke with strict env audit.
npm.cmd run launch:smoke -- --base-url https://gofunmotion.com --strict-env --env-file apps/website/.env.production.local
```

The script checks:

- Vercel/Firebase env presence without printing secret values.
- Payment env vars are absent.
- Public launch pages return `200`.
- Canonicals and OG image URLs match production.
- Protected/account pages render `noindex`.
- Sitemap excludes deprecated/protected routes and includes launch routes.
- Robots points to the canonical sitemap.
- Manifest has GoFunMotion branding, maskable icon, and splash screenshot.
- `/api/plan` returns a useful plan.
- `/api/search` returns approved/published listings.
- Deprecated challenge routes redirect into the Deals product.
- Checkout route stays disabled.

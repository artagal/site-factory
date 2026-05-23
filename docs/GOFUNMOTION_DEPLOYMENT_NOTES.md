# GoFunMotion Deployment Notes

This repository now serves GoFunMotion as the primary website for `gofunmotion.com`.

## Vercel

- Framework: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `.next` when the Vercel project root is `apps/website`
- Domain: `gofunmotion.com`

## Firebase

Firebase is optional. The app works without Firebase by using localStorage for progress, saved challenges, completed challenges, XP, streaks, and waitlist fallback.

When ready, configure these Vercel environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## AI Generation

`/api/generate-challenge` currently uses local challenge templates. Later, add a server-side AI provider call inside that route or a dedicated service module. Do not expose AI keys on the client.

## Payments

Premium UI is planned, but no Stripe or payment flow is connected yet.

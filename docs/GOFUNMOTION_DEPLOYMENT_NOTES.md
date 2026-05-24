# GoFunMotion Deployment Notes

This repository now serves GoFunMotion as the primary website for `gofunmotion.com`.

## Vercel

- Framework: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `.next` when the Vercel project root is `apps/website`
- Domain: `gofunmotion.com`

## Firebase

Firebase is optional for browsing demo deals, but live auth, saves, booking requests, partner dashboards, admin approvals, and paid subscription entitlement sync require Firebase.

When ready, configure these Vercel environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON`

## Planner

`/api/plan` uses local rules and approved listing data. Do not add OpenAI, Gemini, Places, Ticketmaster, Eventbrite, or other paid APIs until the core deal marketplace is validated.

## Payments

Partner subscriptions use Stripe Checkout and Stripe webhooks.

Required Vercel environment variables:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_GROWTH_MONTHLY`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL=https://gofunmotion.com`

Create recurring monthly Stripe prices for:

- Growth: `$29/mo`
- Pro: `$99/mo`

Webhook endpoint:

```text
https://gofunmotion.com/api/webhooks/stripe
```

Initial webhook events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Consumer checkout and Stripe Connect marketplace payouts are future features. Keep booking requests request-based until real partner fulfillment, refund, and confirmation policies are ready.

# Stripe Partner Billing

GoFunMotion uses Stripe Billing only for approved business subscriptions. Consumer activity bookings remain request-based and are never sent through this checkout flow.

## Plans

- Starter: free, one active deal.
- Growth: `$29/month`, up to ten active deals, standard analytics, and featured eligibility.
- Pro: `$99/month`, unlimited active deals, advanced analytics, and priority campaign eligibility.

Stripe Price IDs are environment-specific and supplied through `STRIPE_GROWTH_PRICE_ID` and `STRIPE_PRO_PRICE_ID`. Prices are never accepted from the browser.

## Routes

- `GET /api/partner/billing?businessId=...`: authenticated owner billing status.
- `POST /api/partner/billing/checkout`: authenticated hosted subscription Checkout.
- `POST /api/partner/billing/portal`: authenticated Stripe Billing Portal session.
- `POST /api/webhooks/stripe`: raw-body, signature-verified entitlement updates.

Checkout requires an approved business owned by the authenticated Firebase user. Existing non-terminal subscriptions must be managed through the Billing Portal to prevent duplicate subscriptions.

## Firestore

Public entitlement fields are limited to `pricingTier` and `paidAccessEnabled` on `businesses/{businessId}`.

Private Stripe identifiers and detailed subscription state are stored in `businessBilling/{businessId}`. Processed event IDs are stored in `stripeWebhookEvents/{eventId}` so webhook retries are idempotent. Both collections deny all client SDK access.

Only `active` and `trialing` subscriptions enable paid capabilities. Unknown, incomplete, past-due, unpaid, paused, or canceled states fail closed to Starter limits.

## Required Vercel Variables

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_GROWTH_PRICE_ID
STRIPE_PRO_PRICE_ID
```

Create recurring monthly Growth and Pro prices in the same Stripe mode as the secret key. Configure the webhook endpoint as `https://gofunmotion.com/api/webhooks/stripe` with these events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Enable the Stripe Billing Portal and allow subscription plan changes between the same Growth and Pro products. Active, trialing, past-due, unpaid, incomplete, or paused subscriptions are managed through the portal rather than creating duplicates.

Use Stripe test mode for end-to-end QA before adding live variables or promoting the deployment.

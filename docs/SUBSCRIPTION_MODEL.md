# Subscription Model

Date: 2026-06-04

## Strategy

GoFunMotion should keep customer discovery and request flow free in the MVP. Monetization should focus first on providers/hosts that receive business value from filling last-minute activity spots.

GoFunMotion should not feel like an unlimited posting board. Paid plans increase controlled drop capacity and provider workflow, but every drop should still represent a real time-bound activity, opening, cancellation, slow-time deal, or limited availability.

No payment checkout is part of the MVP unless separately approved. This document defines product entitlements and plan limits, not a billing implementation.

## Customer Plan

### Customer Free

Price: `$0`

Included:

- Browse active local drops.
- Use search, filters, and map/list discovery.
- Save drops after sign-in.
- Request/reserve spots without payment at MVP.
- Track request status.
- Leave reviews after completed requests.

Future customer premium can be considered only after supply quality is strong enough. Do not charge customers for scarcity before the marketplace is valuable.

## Provider Plans

### Free Starter

Purpose: reduce provider acquisition friction.

Included:

- 1 active drop per day.
- Basic provider profile.
- Basic image upload.
- Booking request inbox.
- Accept/decline requests.
- Basic review visibility.

Limit rule:

- A live drop means `active` or otherwise publicly requestable.
- Draft, expired, cancelled, rejected, booked, and completed drops do not count against the daily active limit.

### Pro Motion

Purpose: individual provider upgrade for more marketplace activity.

Included:

- 3 active drops per day.
- Better visibility controls when ranking is implemented.
- Repost/templates if implemented.
- Basic analytics.
- Review and reliability summary.

Positioning:

- More daily drops and better workflow for providers who regularly fill last-minute spots.
- Not unlimited drops.

### Venue / Team Growth

Purpose: venues or teams with multiple hosts/staff.

Included:

- Multiple hosts/staff.
- 3 active drops per host per day.
- Venue/team profile.
- Activity analytics.
- Team request management later.

Positioning:

- Built for venues, studios, activity operators, and host teams.
- Still controlled by quality and daily active limits.

## Entitlement Fields

Use `subscriptions/{userId}`:

- `plan`: `free_starter` | `pro_motion` | `venue_team_growth`
- `entitlement`: string
- `status`: `active` | `trialing` | `past_due` | `cancelled` | `expired` | `none`
- `currentPeriodEnd`: timestamp | null
- `source`: `manual` | `app_store` | `play_store` | `billing_provider` | `migration`
- `updatedAt`: timestamp

## Enforcement

Plan limits must be enforced outside UI-only logic.

Recommended enforcement:

- Client UI reads subscription and shows usage.
- Create Drop form warns when limit is reached.
- Cloud Function or rules-backed trusted write validates active drop count before publishing.
- Admin can override or adjust subscription state through trusted admin tooling.

## Feature Gating Matrix

| Feature | Customer Free | Free Starter | Pro Motion | Venue / Team Growth |
| --- | --- | --- | --- | --- |
| Browse active drops | Yes | Yes | Yes | Yes |
| Save drops | Yes | No | No | No |
| Request spot | Yes | No | No | No |
| Create drops | No | Yes | Yes | Yes |
| Active drop allowance | No | 1/day | 3/day | 3/host/day |
| Provider profile | No | Basic | Enhanced | Venue/team |
| Request inbox | No | Yes | Yes | Yes |
| Templates/repost | No | Later/basic | Yes | Yes |
| Analytics | No | Minimal | Basic | Team/activity |
| Multi-host tools | No | No | No | Yes |
| Unlimited public posting | No | No | No | No |

## Billing Boundary

Do not implement:

- Stripe Checkout.
- Escrow.
- Refunds.
- Payouts.
- Store subscription purchases.
- RevenueCat or billing provider IDs.

Implement only after provider plan, store requirements, and billing provider are approved.

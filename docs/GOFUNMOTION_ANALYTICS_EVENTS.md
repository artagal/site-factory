# GoFunMotion Analytics Events

Analytics are intentionally lightweight during validation. No external analytics vendor is connected yet.

## Stored Events

Events are written to browser localStorage:

```text
gofunmotion:analytics-events
```

In local development, events are also logged to the browser console:

```text
[GoFunMotion analytics]
```

The `trackEvent` helper also sends events to:

```text
/api/track
```

When Firebase Admin is configured in Vercel, that trusted route writes sanitized event records to `analyticsEvents`, increments selected `globalStats/main` counters, and updates approved listing counters for views, saves, and booking-intent clicks. If the route fails, the product loop continues and local events remain available.

To inspect events:

```js
JSON.parse(localStorage.getItem("gofunmotion:analytics-events") ?? "[]")
```

To clear events:

```js
localStorage.removeItem("gofunmotion:analytics-events")
```

## Current Events

```text
booking_request_started
booking_request_submitted
hero_cta_click
listing_saved
listing_viewed
login_clicked
partner_application_submitted
plan_generated
plan_saved
waitlist_submitted
```

## Validation Use

Track the primary product loop:

```text
hero_cta_click -> plan_generated -> listing_viewed -> booking_request_started -> booking_request_submitted
```

Secondary validation:

```text
listing_saved
plan_saved
login_clicked
partner_application_submitted
waitlist_submitted
```

## Later Upgrade

Keep external scripts out until validation needs real aggregated reporting through Firebase Analytics, PostHog, Plausible, or another vendor. Do not add paid APIs or checkout tracking until the booking and partner payment policy is ready.

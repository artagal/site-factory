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

When Firebase Admin is configured in Vercel, the same events are also sent to:

```text
/api/events
```

That trusted server route writes sanitized event records and increments aggregate `globalStats/main` counters. If the route fails, the product loop continues and local events remain available.

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
hero_cta_click
account_deleted
challenge_generated
challenge_started
challenge_completed
challenge_saved
challenge_shared
email_verification_sent
login_clicked
waitlist_submitted
```

## Validation Use

Track the short product loop:

```text
hero_cta_click -> challenge_generated -> challenge_started -> challenge_completed
```

Secondary validation:

```text
challenge_saved
challenge_shared
login_clicked
waitlist_submitted
```

## Later Upgrade

The `trackEvent` helper already forwards sanitized events to a trusted server endpoint. Keep external scripts out until validation needs real aggregated reporting through Firebase Analytics, PostHog, Plausible, or another vendor.

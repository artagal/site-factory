# GoFunMotion Analytics Events

Analytics are intentionally local and lightweight during validation. No external analytics vendor is connected yet.

## Stored Events

Events are written to browser localStorage:

```text
gofunmotion:analytics-events
```

In local development, events are also logged to the browser console:

```text
[GoFunMotion analytics]
```

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
challenge_generated
challenge_started
challenge_completed
challenge_saved
challenge_shared
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

The local `trackEvent` helper can later forward the same event payloads to Firebase Analytics, PostHog, Plausible, or a trusted server endpoint. Keep external scripts out until validation needs real aggregated reporting.

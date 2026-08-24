# GoFunMotion AI Features

GoFunMotion uses the OpenAI Responses API only from Next.js server routes. The browser and FlutterFlow app never receive the OpenAI key.

## Features

| Feature | Endpoint | Guardrail |
| --- | --- | --- |
| Smart Search | `POST /api/ai/smart-search` | Produces canonical filters and returns only supplied approved listings. |
| AI Plan | `POST /api/plan` or `POST /api/ai/plan` | Model may order only approved listing IDs. The server adds canonical price, time, capacity, and copy. |
| Partner Copy | `POST /api/ai/partner-copy` | Requires business owner/admin auth. Rejects added numbers or contact data. Result stays editable. |
| Booking Message | `POST /api/ai/booking-message` | Requires auth and a live approved listing. Creates an editable customer message and never submits it. |
| Listing Review | `POST /api/ai/review-listing` | Deterministic checks are mandatory. AI can recommend, but only an admin can approve/publish. |
| Support | `POST /api/ai/support` | Grounded in local FAQ, blocks sensitive-data requests, and escalates risky cases to a human. |

All features have deterministic fallback behavior. The product remains usable when OpenAI is unavailable or not configured.

## Vercel Configuration

Add `OPENAI_API_KEY` as a server-only secret for Production, Preview, and Development. Do not prefix it with `NEXT_PUBLIC_`. The same protected OpenAI project key used by BeautyDrop can be reused if that key is intentionally shared across products, but its value must be entered in Vercel rather than copied into this repository.

Set `OPENAI_MODEL=gpt-5-mini` initially. Feature-specific model variables are optional and override the default. Add the daily limit variables from `apps/website/.env.example` and leave `AI_REQUIRE_PERSISTENT_LIMITS=true` in production.

After changing Vercel environment variables, redeploy the website so server functions receive them.

## Firebase Operations

AI usage counters are stored in `aiUsage`. Audit metadata is stored in `aiAuditEvents`. Neither collection is readable or writable from client SDKs. Audit entries include feature, model, latency, token counts, hashed scope, and status; prompts and generated text are not stored.

Deploy the updated rules with:

```powershell
npm.cmd run firebase:deploy:firestore
```

## FlutterFlow

FlutterFlow should call the GoFunMotion HTTPS endpoints through API Calls. Authentication-required calls send the Firebase ID token as `Authorization: Bearer <token>`. Do not add `OPENAI_API_KEY` to FlutterFlow app state, remote config, custom code, or client headers.

Recommended Builder-first order:

1. Smart Search on Explore.
2. AI Plan action on Find.
3. Booking Message action beside the editable message field.
4. Partner Copy and Listing Review actions in the partner editor.
5. Support Assistant on Support.

## Safety Invariants

- AI cannot create or publish listings.
- AI cannot approve a partner or deal.
- AI Plan cannot return unknown listing IDs.
- Canonical listing records remain the source of price, date/time, availability, business, city, and remaining spots.
- Booking Message never sends a request automatically.
- Support never asks for passwords, card details, API keys, or identity documents.
- Missing AI configuration falls back safely rather than breaking browsing, planning, or partner drafts.


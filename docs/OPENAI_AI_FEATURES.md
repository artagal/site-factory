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

### Implemented Native Experience (2026-08-26)

- `AiAssistantPage` has canonical city selection, Deals/Plan mode, editable prompts,
  loading/error/empty states, native result cards, View Deal, Save Plan, and Share.
- `AiSupportPage` provides editable questions, FAQ fallback, and an email handoff.
  It does not read private booking status or pretend a human has received a message.
- `FindPlanPage` now renders actual matched cards, not just a summary next to static
  examples. Discover and Deals link to the assistant; deals remain the main product.
- Booking Message and Partner Copy stay next to native editable fields. A per-page
  AI toggle defaults to false on all five user-facing AI surfaces. No AI runs on load.
- `POST /api/mobile/assistant` accepts `mode: deals | plan | support`, `cityId`,
  `query`, and explicit boolean `aiConsent`. Optional form preferences are `budget`,
  `when`, `who`, and `vibe`. It returns `title`, `answer`, `cards`, `provider`,
  `empty`, `needsHumanSupport`, and `planJson`.
- Mobile cards exclude demo, pending, expired, and sold-out inventory. The chosen
  city overrides any AI city suggestion. Empty cities retain zero real results;
  curated ideas explicitly say they are not available bookings.
- The model only orders verified IDs. The server enforces combined plan budget and
  activity duration bounds, uses canonical currencies, and excludes travel from
  the displayed activity duration. Partners must confirm timing and party pricing.
- Saved plans accept the exact `planJson` snapshot through the authenticated API.
  FlutterFlow JSON escaping and UTF-8 are enabled for user-entered text and saves.
- All screens, lists, consent toggles, actions, and state are native Builder nodes.
  One small custom function converts an approved-result ID to a Firestore reference;
  it does not read/write data or contain UI. No new custom widget was introduced.

Original GPT-5 family requests use minimal reasoning and at least 1,024 output
tokens so reasoning cannot consume the old small JSON budget. Incomplete provider
responses fail back to deterministic behavior rather than accepting partial text.

An authorized, server-process-only smoke test with the existing BeautyDrop key
returned `provider: openai` and correct Miami/date-night/tonight/under-$50 filters.
This verifies the key and parser, not deployed mobile-to-production connectivity.
No key was copied into source, FlutterFlow, Git, or a new local env file. Vercel
configuration still requires the owner's dashboard login and a redeploy.

## Safety Invariants

- AI cannot create or publish listings.
- AI cannot approve a partner or deal.
- AI Plan cannot return unknown listing IDs.
- Canonical listing records remain the source of price, date/time, availability, business, city, and remaining spots.
- Booking Message never sends a request automatically.
- Support never asks for passwords, card details, API keys, or identity documents.
- Missing AI configuration falls back safely rather than breaking browsing, planning, or partner drafts.

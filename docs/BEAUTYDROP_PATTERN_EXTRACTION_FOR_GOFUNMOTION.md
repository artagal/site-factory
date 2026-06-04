# BeautyDrop Pattern Extraction For GoFunMotion

Date: 2026-06-04

## Purpose

BeautyDrop is a useful reference because it solved a similar two-sided, last-minute marketplace problem. GoFunMotion should reuse the operating patterns, UX flow structure, FlutterFlow governance, and trust/safety lessons, but it must not copy BeautyDrop's branding, beauty taxonomy, Supabase implementation, RevenueCat identifiers, app IDs, or store metadata.

GoFunMotion is an entertainment and activity marketplace. Its core object is a real last-minute activity drop: an open spot, cancellation, limited-time discount, small event opening, class seat, or entertainment availability.

## Patterns Worth Reusing

### Role-Based Onboarding

- Start with a clear role choice: customer or provider/host.
- Store role in a backend profile document, not only local state.
- Route after sign-in from the backend profile role.
- Keep admin access separate from normal role selection.
- Support email/password, Google, and Apple sign-in.

### Request-First Marketplace

- Let customers browse without login.
- Require login only for favorites, booking requests, profile, provider dashboard, and admin.
- Do not collect payment at MVP request time.
- Use request statuses so both sides understand what happened.
- Make accepted requests show next steps clearly.

### Discovery And Map/List UX

- Category chips should be visible, fast, and resettable.
- Search should go to a real search/filter surface, not a placeholder message.
- Map and list views must use the same active filters.
- Empty states should explain why no drops are visible and offer a reset action.
- Discovery should show only active/requestable marketplace inventory.

### Detail And Request Flow

- Detail pages should receive a drop id page parameter and query the selected drop directly.
- Request forms should show a compact selected-drop summary.
- Customer contact fields need validation and must not expose private data publicly.
- Provider contact details should only be exposed after the request status allows it.

### Provider Dashboard

- Dashboard should show active drops, pending requests, plan usage, and a create-drop CTA.
- Provider lists should be real backend queries, not fixed placeholder rows.
- Provider-created drops should keep admin approval requirements before public visibility when moderation is enabled.

### Location Snapshot

- Provider profile stores the default business/activity location.
- A drop copies a location snapshot at publish time.
- Changing provider profile address later must not move old drops.
- Publishing should be blocked when a provider requires a physical location and has not completed location setup.

### Favorites And Saved Drops

- Favorites must be user-owned backend records.
- False signed-out prompts are a product bug. Use Firebase Auth state and user-owned Firestore queries rather than custom signed-in flags.
- Saved lists should load from Firestore and handle empty, loading, and error states.

### Reviews And Reliability

- Reviews should be allowed only after completed booking requests.
- One review per completed request.
- Reviews begin moderation-safe before public display.
- Reliability score can be internal, but customer UI should show only safe labels such as New provider, Verified profile, Reliable host, and Fast responder.
- Do not expose raw scores, penalty counts, admin notes, or low-reliability labels to customers.

### Reports, Moderation, And Admin

- Users can report listings, providers, reviews, and request issues.
- Admin can review reports, suspicious drops, reviews, users, and provider verification.
- Admin actions should be logged.
- User delete/deactivate should be soft-delete/anonymize by default.

### Push Notifications

- Register device tokens after login and app launch because tokens rotate.
- Booking request events should notify the provider.
- Accept/decline/cancel events should notify the customer or provider as appropriate.
- Server-side FCM sending must not expose private keys to FlutterFlow or client code.

### Subscription Limits

- Customer browsing and requests stay free at MVP.
- Provider plans increase controlled daily drop capacity and team workflow.
- Do not create an unlimited public posting plan.
- Plan limits must be enforced server-side or by security-backed trusted logic, not only by disabled UI.

## Patterns To Avoid

- Beauty-specific language, service taxonomy, and app-store copy.
- BeautyDrop colors, logo treatment, and brand voice.
- Supabase RLS, RPC names, table names, service-role patterns, or bearer-token details.
- RevenueCat product IDs, Apple/Google subscription IDs, or BeautyDrop pricing copy.
- Page-sized custom widgets that hide normal UI from FlutterFlow Builder.
- Excessive App State for data that should be page state, component state, page params, auth user data, or Firestore query rows.
- Placeholder cards that look like real marketplace data.
- Public display of admin notes, raw reliability scores, penalties, or internal moderation states.

## Supabase Items To Translate To Firebase

| BeautyDrop Concept | GoFunMotion Firebase Translation |
| --- | --- |
| Supabase Auth user id | Firebase Auth `request.auth.uid` |
| `profiles` role row | `users/{uid}` with role and onboarding state |
| Professional profile row | `provider_profiles/{uid}` |
| Customer profile row | `customer_profiles/{uid}` |
| `open_slots` | `drops/{dropId}` |
| `booking_requests` | `booking_requests/{requestId}` |
| Favorites table/RPC | `favorites/{favoriteId}` or user subcollection with Firestore rules |
| Supabase RLS | Firebase Security Rules |
| Supabase RPC | Firestore client queries when safe, Cloud Functions when trusted writes are needed |
| Supabase Storage | Firebase Storage buckets/folders |
| Realtime listeners | Firestore realtime listeners |
| Server secret env vars | Cloud Functions or server routes with non-public env vars |

## FlutterFlow Builder-Friendly Lessons

- Inspect the live FlutterFlow project before editing.
- Manual Builder edits are the source of truth.
- Use native widgets, components, backend queries, native actions, conditional visibility, page state, component state, and page params before custom code.
- Keep forms, cards, filters, navigation, colors, typography, and empty states editable in Builder.
- Use custom functions only for simple pure utilities.
- Use custom actions only for security-sensitive or unsupported flows.
- Use custom widgets only as a last resort, typically for map marker behavior that Builder cannot express.
- Do not remove App State fields until all readers are replaced and device QA passes.

## GoFunMotion-Specific Adaptations

- Replace beauty drops with entertainment/activity drops.
- Replace professional language with provider, host, venue, performer, or activity partner where context fits.
- Replace service categories with activity categories: comedy, live music, dance, escape rooms, karaoke, nightlife, workshops, tours, family activities, date-night activities, sports, social games, and local experiences.
- Keep the promise specific: find something fun to do today.
- Use energetic activity cards, price/deal badges, time urgency, map-forward discovery, and trust signals.
- Keep MVP lightweight: request/reserve flow, not a full ticketing or event management system.

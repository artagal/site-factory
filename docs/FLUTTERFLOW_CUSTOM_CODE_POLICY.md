# FlutterFlow Custom Code Policy

## Core Rule

Builder-first always.

Do not hide normal GoFunMotion UI inside custom widgets. Pages, buttons, cards, filters, forms, navigation, colors, typography, spacing, and visibility logic should remain editable in FlutterFlow Builder.

## Priority Order

Use this order before considering custom code:

1. Native FlutterFlow widgets
2. FlutterFlow Components
3. FlutterFlow Backend Queries
4. FlutterFlow native Actions
5. Conditional Visibility
6. Page State
7. Component State
8. Page Parameters / Route Parameters
9. App State only when truly global
10. Custom Functions only for small pure calculations or formatting
11. Custom Actions only when Builder/native actions cannot do the job
12. Custom Widgets only as last resort

## Custom Code Is Forbidden For

- Full-page layouts
- Normal app headers, nav bars, cards, buttons, filters, or forms
- Simple navigation
- Simple role redirects
- Simple formatting that Builder can handle
- One-screen UI state
- Standard Firebase reads/writes FlutterFlow supports
- Standard auth provider buttons FlutterFlow supports
- Replacing visual layouts with hardcoded Dart
- Business logic that future Builder edits cannot see

## Custom Code Is Allowed Only When

FlutterFlow Builder cannot reasonably do the job, and the user approves the exception.

Acceptable categories:

- Secure server-side API calls
- External SDK integration after approval
- Complex map or geolocation behavior
- Complex calculations that Builder cannot express cleanly
- Small pure formatting helpers where Builder formatting is not enough
- Safe wrapper around a trusted backend endpoint

## Required Pre-Approval Note

Before adding any custom widget, action, or function, write a short note that answers:

- Why native FlutterFlow cannot do this
- What the simplest custom solution is
- Where the custom code will be used
- What UI remains Builder-editable around it
- What secrets or private keys are involved, if any
- How to test it
- How to remove or replace it later

If the reason is only convenience, do not add custom code.

## Security Rules

Never put secret keys in FlutterFlow client code.

Forbidden in the client:

- OpenAI keys
- Gemini keys
- Stripe secret keys
- Supabase service role keys
- RevenueCat private keys
- Apple private keys
- Google service account credentials
- Firebase Admin credentials

Client app should only call:

- FlutterFlow-supported Firebase operations allowed by security rules
- Safe public endpoints
- Authenticated backend endpoints that enforce server-side authorization

## GoFunMotion-Specific Custom Code Guidance

### Auth

Use FlutterFlow/Firebase Auth support for:

- Email/password
- Apple Sign In
- Google Sign In
- Sign out
- Password reset

Do not replace auth screens with custom coded layouts. Auth screens must remain App Store screenshot-ready and Builder-editable.

### Plan Finder

Start with Builder-native controls:

- City dropdown or search field
- When segmented buttons/dropdown
- Who chips/dropdown
- Budget dropdown
- Vibe chips/dropdown
- Time available dropdown
- Indoor/outdoor segmented control

Use Page State for current values. Use a backend query or safe endpoint only when plan generation needs server data.

The user has authorized OpenAI-backed assistance. Use server-only GoFunMotion API
calls, never a provider key in FlutterFlow. Keep prompt fields, consent, result
cards, loading/error states, and actions native and visually editable. Native AI
is opt-in and must retain a non-AI fallback.

The approved `goFunMotionListingReference` custom function only converts a
server-returned listing ID to a native Firestore reference. This small adapter is
needed because API results contain IDs while the existing detail page takes a
document reference. It has no UI, network access, authorization, or database writes.

### Deals

Use Builder-native collection lists and filters where possible.

If a complex search endpoint becomes necessary, isolate it as one API call and keep the result cards Builder-native.

### Booking Requests

Use native form fields and validation. Create Firestore records directly only if rules safely allow it. Use a server endpoint if the write needs trusted fields, business owner notification, or secret credentials.

Do not implement payment checkout yet.

### Partner Dashboard

Use Builder-native forms and lists:

- Business profile
- Listing editor
- Listing status
- Booking request list
- Basic stats

Partner users must not self-approve listings or businesses.

### Admin

Admin approval actions can use secure endpoints if Firestore rules cannot safely express the operation. The admin UI should still be Builder-native.

## Documentation Required For Each Custom Item

For every custom function, custom action, custom widget, or custom API wrapper, add an entry to `docs/FLUTTERFLOW_BUILDER_FRIENDLY_AUDIT.md`:

- Name
- Type
- Purpose
- Where used
- Why Builder cannot replace it
- Inputs and outputs
- Secrets involved, if any
- Risk level
- Keep / replace / simplify / document
- Maintenance notes

## Isolation Rules

If custom code is approved:

- Keep it small.
- Keep it pure where possible.
- Keep UI around it Builder-editable.
- Do not make it own navigation unless necessary.
- Do not make it own page-level layout.
- Do not store broad app state inside it.
- Make failure states visible in Builder-native UI.

## Current Approved Custom Code

Approved narrow custom items are `registerGoFunMotionPushToken` (existing authenticated
push-token registration) and `goFunMotionListingReference` (pure ID/reference adapter).
Their UI, permission choices, API calls, and failure states remain native. No custom
widgets or custom screen layouts are approved. See the Builder-friendly audit for
inputs, outputs, and maintenance boundaries.

The existing Next.js code in `apps/website` is web prototype code, not FlutterFlow custom code. Do not port it wholesale into FlutterFlow custom widgets.

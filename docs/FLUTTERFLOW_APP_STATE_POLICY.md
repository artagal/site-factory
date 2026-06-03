# FlutterFlow App State Policy

## Core Rule

Use App State only for data that must be shared across many unrelated pages.

Most GoFunMotion UI behavior should use Page State, Component State, Page Parameters, backend queries, or auth user data.

## Preferred State Choices

### Use Page State For

- Deals page filters
- Find My Plan form values
- Current tab selection
- Map/list toggle
- Sort option
- One-page loading states
- One-page error messages
- Current form step
- Temporary selected date/time
- Local selected category
- Local selected city if only used on one screen

### Use Component State For

- Expanded/collapsed card state
- Local component loading state
- Local save button pending state
- Local validation display state
- Segment selection inside a reusable component
- Temporary hover/selected visual state

### Use Page Parameters For

- Selected listing
- Selected city
- Selected category
- Selected business
- Booking request listing context
- Partner listing edit context
- Admin review item context
- Return path after login

### Use Backend Queries For

- Listings
- Businesses
- Cities
- Categories
- Saved deals
- Saved plans
- Booking requests
- Partner applications
- Admin status
- User profile and role

### Use Auth User Data For

- UID
- Email
- Display name
- Photo URL
- Provider information
- Email verification state

## Allowed App State

Only create App State when the value is truly global.

Potentially allowed:

- `selectedCityId` if it drives many unrelated tabs and persists across sessions
- `userRole` if backend profile queries cannot be reused cleanly
- `themeMode` if FlutterFlow theme settings cannot handle app-wide light/dark mode
- `activeEnvironment` if demo/live separation must affect multiple unrelated areas
- `lastKnownLocation` only if used across discovery, map, deals, and profile flows

Each App State variable must have:

- Name
- Type
- Owner flow
- Reason it cannot be Page State or a backend query
- Reset behavior
- Persistence setting

## Forbidden App State

Do not use App State for:

- Temporary button state
- One-page filters
- Current tab selection
- Simple form inputs
- One-screen loading state
- One-screen error state
- Current selected listing when a page parameter can pass it
- Data that should come from Firestore
- Auth user identity
- Save button pending state
- Booking request form values
- Partner listing editor draft values unless explicitly needed across screens

## GoFunMotion State Plan

### Home / Discovery

Use Page State for:

- Hero plan finder form values
- Selected quick filter

Use backend queries for:

- Featured listings
- Categories
- Cities

### Find My Plan

Use Page State for:

- City
- When
- Who
- Budget
- Vibe
- Time available
- Indoor/outdoor
- Generated plan display state

Use Page Parameters when deep-linking into the finder with prefilled values.

### Deals List

Use Page State for:

- Filters
- Sort
- Active list/map view
- Filter sheet open/closed

Use backend queries or safe search endpoint for listing results.

### Deal Detail

Use Page Parameters for:

- `listingId` or `listingRef`

Use backend query for:

- Listing details
- Business details
- Saved state

### Saved

Use backend queries for:

- Saved listings
- Saved plans

Do not copy saved records into App State.

### Booking Request

Use Page Parameters for:

- Listing
- Business

Use Page State for:

- Form fields
- Validation messages
- Submit pending state

### Partner Dashboard

Use backend queries for:

- Owned businesses
- Listings
- Booking requests
- Stats

Use Page State for:

- Active tab
- Form fields
- Create/edit mode
- Submit pending state

### Admin Dashboard

Use backend queries for:

- Applications
- Businesses
- Listings
- Cities
- Categories
- Booking requests

Use Page State for:

- Active queue
- Local filters
- Selected moderation action

## Review Checklist

Before finalizing any FlutterFlow phase:

- List every App State variable.
- Confirm each variable is used across unrelated pages.
- Replace one-screen state with Page State.
- Replace component-only behavior with Component State.
- Replace selected records with Page Parameters.
- Replace copied backend data with backend queries.
- Document remaining App State in `docs/FLUTTERFLOW_BUILDER_FRIENDLY_AUDIT.md`.

## Manual Edit Protection

If the user manually edits state handling in FlutterFlow Builder, treat that implementation as the source of truth. Do not regenerate state logic or replace it with custom code without explicit approval.

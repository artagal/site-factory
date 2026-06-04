# FlutterFlow Shared Components Plan

Date: 2026-06-04

## Purpose

Shared components keep the GoFunMotion FlutterFlow app consistent while preserving Builder editability. Build repeated UI as FlutterFlow Components, not custom widgets.

## Component Rules

- Components should expose clear parameters.
- Components should use theme colors.
- Components should support dark and light mode.
- Components should avoid hidden business logic.
- Components should not fetch backend data unless the component is explicitly a small reusable backend-bound row.
- Detail pages should pass ids through page parameters, not selected-item App State.

## Core Components

### BrandHeader

Use:

- Intro.
- Auth pages.
- Settings.

Parameters:

- `title`.
- `subtitle`.
- `showLogo`.

### RoleOptionCard

Use:

- Auth Landing / Role Selection.

Parameters:

- `label`.
- `description`.
- `icon`.
- `isPrimary`.

Actions:

- Navigate to customer or provider onboarding.

### CategoryChip

Use:

- Discovery.
- Filters.
- Provider Create Drop.

Parameters:

- `label`.
- `isSelected`.
- `icon` optional.

State:

- Page state on the parent page.

### FilterBar

Use:

- Discovery.
- Map/List View.

Parameters:

- Selected category/day/price/distance labels.
- `hasActiveFilters`.

Actions:

- Open filter bottom sheet.
- Reset filters.

### DropCard

Use:

- Discovery.
- Saved Drops.
- Provider Manage Drops.
- Related drops.

Parameters:

- `dropId`.
- `title`.
- `imageUrl`.
- `category`.
- `providerName`.
- `startLabel`.
- `locationLabel`.
- `dealPrice`.
- `regularPrice`.
- `spotsRemaining`.
- `isSaved`.
- `status`.

Actions:

- Tap row -> Drop Detail with `dropId`.
- Heart -> auth gate then favorite toggle.

### DropSummaryCard

Use:

- Booking Request.
- Request Detail.
- Review page.

Parameters:

- `title`.
- `timeLabel`.
- `locationLabel`.
- `priceLabel`.
- `imageUrl`.

### PriceBadge

Use:

- DropCard.
- Drop Detail.

Parameters:

- `dealPrice`.
- `regularPrice`.
- `discountPercent`.

### StatusPill

Use:

- My Requests.
- Provider Inbox.
- Manage Drops.
- Admin tables.

Parameters:

- `status`.
- `tone`.

### TrustBadge

Use:

- Drop Detail.
- Provider Profile.
- Provider cards.

Parameters:

- `label`.
- `icon`.
- `tone`.

Allowed customer-facing labels:

- New provider.
- Verified profile.
- Reliable host.
- Fast responder.

Do not expose raw reliability scores or admin notes.

### EmptyState

Use:

- Discovery no results.
- Saved Drops.
- My Requests.
- Provider Inbox.
- Admin empty queues.

Parameters:

- `title`.
- `body`.
- `actionLabel`.
- `showAction`.

### LoadingState

Use:

- Collection pages.
- Auth transitions.
- Submit buttons.

Parameters:

- `label`.
- `variant`.

### ErrorState

Use:

- Query failures.
- Submit failures.

Parameters:

- `title`.
- `body`.
- `retryLabel`.
- `showRetry`.

### FormSection

Use:

- Provider onboarding.
- Create Drop.
- Booking Request.
- Settings.

Parameters:

- `title`.
- `description`.

### ProviderStatCard

Use:

- Provider Dashboard.

Parameters:

- `label`.
- `value`.
- `trendLabel` optional.
- `icon`.

### RequestCard

Use:

- My Requests.
- Provider Inbox.

Parameters:

- `requestId`.
- `dropTitle`.
- `customerOrProviderName`.
- `status`.
- `createdAtLabel`.
- `timeLabel`.

Action:

- Navigate to Request Detail with `requestId`.

### AdminReviewRow

Use:

- Admin Reviews.
- Admin Reports.
- Admin Drops.

Parameters:

- `targetId`.
- `title`.
- `subtitle`.
- `status`.
- `createdAtLabel`.

Actions:

- Open detail.
- Approve/reject through admin-safe action or function.

## State Guidance

Use page state for:

- Discovery filters.
- Map/List toggle.
- Form field values when FlutterFlow controllers are not enough.
- Selected chips.
- Loading/error labels.

Use component state for:

- Local expanded/collapsed sections.
- Local selected tab inside a component.

Use page parameters for:

- `dropId`.
- `requestId`.
- `bookingRequestId`.
- `providerId` when needed.

Use App State only for:

- Current city if shared across many unrelated pages.
- Current role cache only if direct profile query is not practical.
- Theme mode if not handled by FlutterFlow theme settings.

## First Component Build Order

1. EmptyState.
2. LoadingState.
3. ErrorState.
4. CategoryChip.
5. StatusPill.
6. DropCard.
7. DropSummaryCard.
8. RoleOptionCard.
9. FormSection.
10. ProviderStatCard.
11. RequestCard.
12. AdminReviewRow.

Build small, verify in Builder, then reuse.

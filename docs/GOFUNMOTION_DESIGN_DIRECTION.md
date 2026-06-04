# GoFunMotion Design Direction

Date: 2026-06-04

## Brand Goal

GoFunMotion should feel energetic, local, modern, and trustworthy. It is about finding something fun to do today, not about beauty appointments, loyalty points, fake challenges, or a generic coupon board.

The app should support both dark mode and light mode with the same information hierarchy.

## Visual Personality

- Vibrant but not childish.
- Activity-forward and motion-oriented.
- Clean enough for booking/request confidence.
- Social discovery feel without turning into a feed-only app.
- Strong map/list utility for repeated use.

## Palette Proposal

Primary:

- Motion Cyan: `#20C7E8`

Accent:

- Signal Lime: `#B8F34A`

Support:

- Night Magenta: `#C13BE2`

Dark Mode:

- Background: `#07101D`
- Surface: `#111C2B`
- Elevated Surface: `#182637`
- Primary Text: `#F7FAFC`
- Secondary Text: `#A8B3C2`
- Border: `#26384D`

Light Mode:

- Background: `#F7FAFC`
- Surface: `#FFFFFF`
- Elevated Surface: `#EEF5F8`
- Primary Text: `#0C1724`
- Secondary Text: `#526171`
- Border: `#D7E2EA`

Use cyan and lime as the recognizable brand pair. Use magenta sparingly for category variety, nightlife, or highlight badges. Avoid a one-note purple/blue interface and avoid BeautyDrop's exact palette.

## Typography

- Use a clean, modern sans-serif.
- Hero-scale type only on intro/marketing surfaces.
- Dense app pages should use compact headings and scannable labels.
- No negative letter spacing.
- Button text must fit on mobile.

## Core UI Elements

### Drop Cards

Drop cards should include:

- Image.
- Category badge.
- Title.
- Provider/host name.
- Time label.
- City or distance.
- Deal price and regular price when relevant.
- Spots remaining.
- Save heart.

Cards should stay compact and easy to scan.

### Filter Chips

- Use native FlutterFlow Choice Chips.
- Keep active filters visible.
- Provide a reset action.
- Avoid putting filter state in global App State unless multiple unrelated pages need the same value.

### Map/List Toggle

- Use segmented control.
- The selected mode should be obvious in dark and light mode.
- Search this area should be a real action or hidden until implemented.

### Request CTA

- Primary CTA should be clear and direct: `Request Spot`, `Reserve Request`, or `Find My Plan`.
- Secondary CTA can be save/share/report where appropriate.
- Do not show payment copy unless payment is implemented.

### Empty States

Empty states should:

- State what happened.
- Offer a next action.
- Avoid internal terms.

Examples:

- `No drops match these filters.`
- `Try a wider distance or clear filters.`
- `Saved drops will appear here.`

### Loading States

- Use skeleton/list placeholders or a branded compact loading state.
- Avoid blank pages.

### Error States

- Use plain user-facing text.
- Keep retry actions visible.
- Do not show internal Firebase, rule, or API text to users.

## Imagery

Use real activity, venue, local event, and entertainment imagery where possible. Avoid generic abstract gradients as the main visual. For demo/test data, images must be clearly demo or seeded test records.

## Dark And Light Mode Rules

- All text uses theme tokens.
- Do not hardcode dark text on dark surfaces or white text on light surfaces.
- Borders and shadows should differ by mode.
- Cards and sticky controls should preserve contrast.
- Test small mobile viewports for safe-area overlap.

## FlutterFlow Builder Guidance

- Theme colors should be set in FlutterFlow and referenced by widgets.
- Repeated UI should use components: drop card, stat card, status pill, empty state, category chip, trust badge.
- Do not hide whole screens in custom widgets.
- Any custom map or utility code must leave visible controls editable in Builder.

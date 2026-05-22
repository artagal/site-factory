# BeautyDrop FlutterFlow Build Pack

This build pack translates the BeautyDrop validation prototype into a future FlutterFlow app plan. It is planning only. Do not connect payments, external APIs, WordPress, Bluehost, or automated deployment from this document.

## App Roles

- Customer: browses discounted beauty openings and requests a slot
- Beauty professional: posts open appointment slots and reviews requests
- Admin: reviews providers, moderates listings, and handles early manual matching

## Screen List

Customer screens:

- Welcome or city selection
- Deal feed
- Category filter
- Deal detail
- Request slot
- Request submitted
- My requests

Beauty professional screens:

- Pro onboarding
- Business profile
- Post open slot
- My open slots
- Slot request detail
- Edit slot

Admin screens:

- Admin dashboard
- Provider review queue
- Listing review queue
- Request review queue
- Category and city settings

Shared screens:

- Sign in
- Account settings
- Help or FAQ

## Database Tables

`users`

- id
- role
- name
- email
- phone
- city
- created_at

`provider_profiles`

- id
- user_id
- business_name
- categories
- bio
- location_label
- verification_status
- instagram_url
- created_at

`deals`

- id
- provider_id
- category
- service_name
- regular_price
- deal_price
- discount_percent
- appointment_start
- appointment_end
- location_label
- notes
- model_needed
- status
- created_at

`slot_requests`

- id
- deal_id
- customer_id
- status
- customer_note
- provider_note
- requested_at
- updated_at

`categories`

- id
- name
- sort_order
- active

`cities`

- id
- name
- state
- active

`admin_events`

- id
- actor_user_id
- entity_type
- entity_id
- action
- notes
- created_at

## User Flows

Customer request flow:

1. Customer selects a city.
2. Customer browses deal feed.
3. Customer filters by category or date.
4. Customer opens a deal detail screen.
5. Customer taps request slot.
6. Customer enters contact note if needed.
7. Request is marked pending.
8. Provider or admin confirms manually in the early version.

Beauty professional posting flow:

1. Pro creates a profile.
2. Pro posts one open slot.
3. Pro enters service, category, regular price, deal price, time, location, and notes.
4. Pro marks whether this is a model-needed appointment.
5. Slot enters review or active status.
6. Pro reviews incoming requests.

Admin review flow:

1. Admin reviews new provider profiles.
2. Admin reviews submitted deals if moderation is enabled.
3. Admin checks request volume by category and city.
4. Admin manually resolves edge cases while the marketplace is small.

## Custom Functions Needed

- Calculate discount percent from regular price and deal price
- Format appointment date and time labels
- Filter deals by same-day and next-day availability
- Sort deals by appointment start time
- Validate deal price is lower than regular price
- Normalize category names
- Determine whether a deal is expired
- Generate location display text from city and neighborhood fields

## What To Build First In FlutterFlow

Build the smallest testable marketplace loop:

1. Customer deal feed with static or manually entered deals
2. Deal detail screen
3. Request slot flow
4. Provider post open slot flow
5. Admin review dashboard

Defer these until after the first loop works:

- Payments
- Calendar sync
- Automated confirmations
- Provider subscriptions
- Multi-city expansion
- Push notifications
- Advanced search

## Build Standard

The first FlutterFlow version should validate behavior, not completeness. Keep the app focused on one city, a few beauty categories, manually reviewed providers, and simple request statuses.

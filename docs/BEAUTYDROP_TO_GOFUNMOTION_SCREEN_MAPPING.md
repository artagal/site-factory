# BeautyDrop To GoFunMotion Screen Mapping

Date: 2026-06-04

## Scope

This mapping adapts proven BeautyDrop screen concepts to GoFunMotion. It is not a copy plan. All copy, taxonomy, colors, imagery, and Firebase implementation should be GoFunMotion-specific.

## Screen Mapping

| BeautyDrop Concept | GoFunMotion Adaptation | Keep | Change |
| --- | --- | --- | --- |
| Intro Onboarding | Intro Onboarding | Short value story, CTA pair, screenshot-ready polish | Entertainment copy, motion-oriented visual identity, no beauty service language |
| Auth Landing | Auth Landing / Role Selection | Customer/provider role choice, sign-in row, trust badges | Provider labels become host/provider/venue, badges become Local deals/Request first/Verified hosts |
| Customer Onboarding | Customer Sign Up / Onboarding | Name, city, category preferences, auth provider support | Activity categories and entertainment preferences |
| Professional Onboarding | Provider Sign Up / Onboarding | Business profile, location, phone, image, verification status | Provider/host/venue language, activity taxonomy, Firebase profile writes |
| Discovery | Discovery | Category chips, search, filters, saved heart, empty states | Activity cards, event time, price/deal, group/date-night/family tags |
| Customer Map Page | Map/List View | Map/list toggle, search area, shared filters | Firebase-backed active drops and Builder-native filters around any map custom code |
| Deal Detail | Drop Detail | Hero, provider, time, location, price, trust, CTA | Activity details, spots remaining, entertainment-specific expectations |
| Booking Request Form | Booking Request | Selected drop summary, contact fields, message, validation | Request/reserve language, no payment collected at MVP |
| Favorites Page | Saved Drops | User-owned favorites, empty state, remove saved | Firebase favorites collection and current-user query |
| Customer Requests | My Requests | Request list, statuses, detail navigation | GoFunMotion status labels and activity context |
| Request Detail | Request Detail | Status timeline, cancel/report/review actions | Accepted-state next steps for activity/host |
| Booking Review | Booking Review | Completed-only review, stars, tags, would-book-again | Entertainment tags and moderation-safe display |
| Professional Dashboard | Provider Dashboard | Active items, pending requests, plan usage, create CTA | Provider/host dashboard labels and drop capacity |
| Create Slot | Create Drop | Category, schedule, price, capacity, location snapshot, image | Activity/drop fields, event/experience categories, Firebase Storage |
| Slot Management | Manage Drops | Status filters, edit/cancel/repost | Drop statuses and moderation state |
| Professional Inbox | Provider Request Inbox | Pending/accepted/declined lists, accept/decline | Provider request rules and FCM notifications |
| Professional Settings | Provider Settings | Profile, plan, reviews, support, delete account | GoFunMotion plan names and Firebase account handling |
| Admin Users | Admin Users | Search/filter users, status actions, safe soft-delete | Firebase admin claims/docs and Firestore audit log |
| Admin Reviews | Admin Reviews | Pending reviews, approve/hide/reject | Reviews collection and GoFunMotion tags |
| Admin Reports | Admin Reports | Report queue and resolution | Drop/provider/review/request targets |

## Discovery Adaptation

BeautyDrop Discovery becomes GoFunMotion Discovery:

- Category chips for comedy, live music, dance, escape rooms, karaoke, nightlife, workshops, tours, family, date night, sports, and social games.
- Search over drop title, category, activity type, provider name, city, area, and keywords.
- Filters for today, tonight, tomorrow, weekend, price, distance, group size, age/family friendliness, indoor/outdoor, and vibe.
- Cards show image, title, provider, time, city, deal price, regular price when available, spots remaining, and saved heart.
- List and map views must stay consistent.

## Detail Adaptation

BeautyDrop Deal Detail becomes GoFunMotion Drop Detail:

- Hero image should show actual activity/venue when available.
- Time and availability must be prominent.
- Price/deal should be clear without making the app feel like a coupon board.
- Trust area should show approved reviews and safe provider labels.
- CTA should say Request, Reserve, or Request Spot depending on confirmation mode.

## Request Flow Adaptation

BeautyDrop Booking Request becomes GoFunMotion Booking Request:

- Selected drop summary at top.
- Customer contact fields and optional message.
- Party size where relevant.
- Request first, pay after confirmation if payment is not part of MVP.
- No checkout or payment collection until separately approved.

## Provider Flow Adaptation

BeautyDrop Create Slot becomes GoFunMotion Create Drop:

- Category/activity type.
- Deal and schedule details.
- Capacity and spots remaining.
- Provider profile location snapshot.
- Drop image upload.
- Moderation status.
- Plan-limit check.

## Admin Adaptation

Admin concepts carry over, but GoFunMotion should use Firebase authorization:

- `admin_users/{uid}` or custom claims.
- Firestore rules for read/write boundaries.
- Cloud Functions for sensitive moderation actions when rules cannot enforce the transition safely.
- Append-only `admin_actions` records.

# Product Spec: GoFunMotion Deals

## Product Summary

GoFunMotion Deals is a local discovery and deals platform that helps users find real fun things to do today based on city, mood, time, budget, and who they are with.

Main brand: **GoFunMotion**

Product name: **GoFunMotion Deals**

Main headline:

```text
Find something fun to do today.
```

Main CTA:

```text
Find My Plan
```

Subheadline:

```text
Tell us your city, mood, time, budget, and who's going. GoFunMotion finds real plans, local activities, and last-minute deals you can actually do.
```

## Product Positioning

GoFunMotion Deals should become:

- A local fun finder.
- A last-minute activity deals platform.
- A plan generator for real-life activities.
- A marketplace-ready platform for local businesses.
- A future booking, lead fee, affiliate, and partner subscription platform.

The product should clearly answer:

- Users visit to find real things to do.
- Businesses join to fill empty slots and promote activities.
- GoFunMotion monetizes through booking commissions, lead fees, promoted listings, subscriptions, affiliate links, and premium planning.

## Remove Old Core Concepts

These are no longer the product:

- Fake XP as the main product.
- Public leaderboard.
- Random challenge generator as the main product.
- Meaningless `Complete` button.
- Streaks as main value.
- Challenge rarity as a core mechanic.
- `Replace scrolling with real life` as the main headline.

The old phrase can remain only as small supporting brand copy.

## New Core Concepts

Use these terms consistently:

- Plan.
- Deal.
- Activity.
- Booking Request.
- Partner.
- Saved Plan.
- Saved Deal.
- Business Dashboard.
- Admin Approval.

Avoid using these as central concepts:

- Mission.
- XP.
- Streak.
- Complete.
- Leaderboard.

## Primary Users

### Bored Individual

Need: quick fun plan based on mood, time, budget, and city.

### Couple

Need: date-night ideas, local deals, romantic/chill/adventurous plans.

### Friends Or Group

Need: group-friendly activities and fast decision support.

### Parents Or Families

Need: family-safe activities, kids deals, indoor/outdoor filters.

### Local Business

Need: list activities, promote deals, fill empty slots, and receive booking requests.

## Main User Flow

1. User lands on the homepage.
2. User understands: this helps me find something fun to do.
3. User clicks `Find My Plan`.
4. User enters:
   - city/location
   - when: today, tonight, tomorrow, weekend, custom date
   - who: solo, date, friends, family, kids
   - budget
   - mood/vibe
   - indoor/outdoor
   - time available
5. Site returns:
   - one simple plan
   - one local activity idea
   - one deal/bookable option when available
   - one backup option
6. User can:
   - save the plan
   - share the plan
   - open deal
   - request booking
   - join waitlist if city is not active
7. Login is offered only when needed for saves, booking requests, profile, partner dashboard, or admin.

## Main Website Structure

Required routes:

- `/`
- `/find`
- `/deals`
- `/deals/[slug]`
- `/cities/[citySlug]`
- `/categories/[categorySlug]`
- `/date-night`
- `/friends`
- `/family`
- `/partner`
- `/partner/apply`
- `/partner/dashboard`
- `/profile`
- `/saved`
- `/about`
- `/pricing`
- `/blog`
- `/blog/[slug]`
- `/privacy`
- `/terms`
- `/admin`

## Homepage Requirements

Homepage sections:

1. Hero.
2. Quick plan finder form.
3. Featured deals.
4. Popular categories.
5. How it works.
6. Date night section.
7. Friends/group section.
8. Family/kids section.
9. Partner/business section.
10. City waitlist section.
11. Blog/ideas section.
12. Footer.

Hero visual should use:

- Activity cards.
- Deal cards.
- City plan cards.
- Map-like or glowing city grid visual.
- Example cards:
  - `Comedy Night - Tonight`
  - `Pottery Class - 25% Off`
  - `Date Night Under $50`
  - `Kids Indoor Play - Weekend`
  - `Escape Room - Last-Minute Slot`
  - `Dance Trial Class - $10`
  - `Mini Golf - Friends Plan`

Trust copy:

```text
No endless searching. No fake points. Just real things to do.
```

## Plan Finder Fields

- Location: city input and optional `near me` placeholder.
- When: Today, Tonight, Tomorrow, This weekend, Custom date.
- Who's going: Solo, Date, Friends, Family, Kids.
- Budget: Free, Under $25, Under $50, Under $100, Flexible.
- Vibe: Chill, Romantic, Active, Social, Creative, Family-friendly, Adventurous, Low-energy, Rainy day, Surprise me.
- Time available: 30 minutes, 1 hour, 2 hours, Half day, Full evening.
- Indoor/outdoor: Indoor, Outdoor, Either.

Results should show 3 to 5 cards with title, description, estimated price, time, category, why it fits, and CTA.

## Deals Requirements

The `/deals` page should support:

- City filter.
- Category filter.
- Date/time filter.
- Budget filter.
- Who's going filter.
- Indoor/outdoor filter.
- Discount filter.
- Distance placeholder.
- Rating placeholder.
- Availability filter.

Sort options:

- Featured.
- Tonight.
- Biggest discount.
- Under $25.
- Family-friendly.
- Date night.
- Newest.

Deal cards should show:

- Image or gradient visual.
- Title.
- Business name.
- City.
- Category.
- Original price.
- Deal price.
- Discount badge.
- Time/date availability.
- Short description.
- Tags.
- CTA: `View Deal`.

## Deal Detail Requirements

Each listing detail page should show:

- Title.
- Image/gallery.
- Business name.
- Location.
- Category.
- Price and original price.
- Discount.
- Available dates/times.
- Duration.
- Group size.
- Indoor/outdoor.
- Description.
- Why it's fun.
- What's included.
- Terms.
- Cancellation note placeholder.
- Map placeholder.
- Business info.
- CTAs: `Request Booking`, `Open Booking Link`, `Save`, `Share`.

Until payments exist, use `Request Booking`, not `Buy Now`.

## Partner Product

Partner headline:

```text
Fill empty slots with people looking for something fun to do.
```

Partner value:

- List activities.
- Promote last-minute deals.
- Receive booking requests.
- Fill unused capacity.
- Reach people searching for local plans.

Business categories:

- Escape rooms.
- Bowling.
- Dance studios.
- Fitness studios.
- Yoga/pilates.
- Pottery studios.
- Cooking classes.
- Kids activity centers.
- Trampoline parks.
- Mini golf.
- Museums.
- Comedy clubs.
- Wellness/spa.
- Local tours.
- Workshops.
- Arcades.

## Monetization Architecture

Future revenue models:

- Booking commission.
- Lead fee.
- Promoted listings.
- Business subscription.
- Affiliate links.
- Sponsored guides.
- Premium consumer planning.

Partner pricing page:

- Starter - Free: 1 active listing, booking requests, basic profile.
- Growth - $29/month: up to 10 listings, deal campaigns, basic analytics, featured city eligibility.
- Pro - $99/month: unlimited listings, priority placement, advanced analytics, promoted campaigns, dedicated support.

Do not implement payments yet.

## SEO Strategy

Homepage metadata:

Title:

```text
GoFunMotion - Find Fun Things To Do Today
```

Description:

```text
Discover local activities, last-minute deals, date ideas, family fun, and spontaneous plans based on your mood, time, budget, and city.
```

Keywords:

- things to do today
- fun things to do near me
- local activity deals
- date night ideas
- family activities
- last minute deals
- activity finder
- weekend plans
- local experiences
- fun finder

SEO pages:

- `/date-night`
- `/friends`
- `/family`
- `/cities/[citySlug]`
- `/categories/[categorySlug]`
- blog articles

Sample blog topics:

- Best things to do when you're bored.
- Date night ideas under $50.
- Fun things to do with friends this weekend.
- Family activities when it rains.
- How local businesses can fill empty slots.
- Last-minute activities near you.

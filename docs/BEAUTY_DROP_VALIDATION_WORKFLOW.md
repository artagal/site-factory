# BeautyDrop Validation Workflow

BeautyDrop is a validation-first marketplace concept for discounted same-day and next-day beauty appointment openings. This workflow keeps the project local and Vercel-ready while avoiding payments, external APIs, WordPress, Bluehost, and production booking infrastructure.

## Pages To Use

- `/beauty-drop`: premium landing page for the core marketplace promise
- `/beauty-drop/deals`: customer-side deal card prototype
- `/beauty-drop/pros`: beauty professional open-slot submission prototype
- `content/sites/validation/beauty-drop/beauty-drop-validation.md`: strategy and validation source note

## How To Use The Landing Page

Use the landing page to test whether visitors quickly understand the offer:

- Customers can find last-minute beauty appointments at a discount.
- Beauty professionals can fill cancellations, slow hours, and model-needed sessions.
- The first action is choosing a side of the marketplace.

Do not add live booking, payments, provider accounts, customer accounts, or third-party integrations until the validation metrics justify it.

## How To Test Demand

Start with one city or dense local area. Send traffic from local social posts, beauty groups, provider outreach, and direct conversations.

Run tests in this order:

1. Test headline clarity on `/beauty-drop`.
2. Test customer intent with clicks to `/beauty-drop/deals`.
3. Test provider intent with clicks to `/beauty-drop/pros`.
4. Ask providers whether they would post one real discounted slot this week.
5. Ask customers whether they would request one specific appointment at the displayed price and time.

When forms or analytics are added later, keep the first collection lightweight and explicit.

## Metrics To Track

- Landing page visits by traffic source
- Click-through rate to "I want beauty deals"
- Click-through rate to "I am a beauty professional"
- Deal-card request clicks
- Provider submission starts and completions after a real form is added
- Category interest by click behavior
- Number of providers willing to post a real opening
- Number of customers willing to request a specific slot
- Objections about trust, timing, price, service quality, and location

## When To Build The Real App

Move beyond the static prototype only when the same local market shows both sides of the marketplace:

- At least 10-20 providers say they would post real open slots.
- Customers click or request specific appointment cards repeatedly.
- One or two categories clearly outperform the rest.
- Providers can explain what information they need before accepting a request.
- Customers understand whether the request is confirmed, pending, or manually approved.

The first production build should still be narrow: one city, limited categories, manual moderation, and no broad marketplace expansion.

## FlutterFlow Connection Later

FlutterFlow should become the first app-building layer after the validation prototype proves demand. Use the web prototype to define screen copy, marketplace roles, and early data fields.

Do not start in FlutterFlow with the full marketplace. Start with:

- Customer deal browsing
- Provider open-slot submission
- Manual admin review
- Request status states
- Basic city/category filters

Keep payments, advanced scheduling, notifications, and calendar sync out of the first FlutterFlow build unless real validation data proves they are required.

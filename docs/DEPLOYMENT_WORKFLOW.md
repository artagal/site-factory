# Deployment Workflow

Deployment is intentionally not configured yet.

## Current State

- The Next.js app runs locally from `apps/website`.
- Sitemap and robots files can be generated locally.
- No Bluehost connection exists.
- No automatic deployment exists.
- `robots.txt` intentionally points to a placeholder sitemap URL until a real base URL is chosen.

## Future Manual Checklist

1. Choose hosting intentionally.
2. Add environment variable documentation.
3. Add preview deployment checks.
4. Add a manual release checklist.
5. Connect publishing only after credentials and rollback steps are understood.

## Not Yet Allowed

- Automatic deploy hooks
- Bluehost credentials
- WordPress credentials
- Paid API calls
- Payment processing

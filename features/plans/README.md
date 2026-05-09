# Plans

This module owns the SaaS plan foundation. It intentionally does not integrate with Stripe or another payment provider yet.

## Tiers

- Free: €0/month, up to 2 non-archived projects.
- Medium: €10/month, up to 30 non-archived projects, marked as most popular.
- Premium: €50/month, unlimited non-archived projects.

Project usage counts draft, proposal, payment-confirmed, active, paused, and complete projects. Archived projects do not count toward the limit.

## Current Behavior

- New agencies default to Free with `subscription_status = free`.
- Paladar is seeded and migrated as Premium with `subscription_status = manual`.
- Project creation checks the current organization's plan server-side before inserting client or project records.
- `/admin/billing` can mark Medium or Premium manually for owner/admin users. This is a temporary placeholder and must be replaced by provider-backed checkout and webhook state before real payment enforcement.

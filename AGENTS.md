# Agent Operating Guide

Future Codex sessions must read this file and `docs/context.md` before making changes.

## Product Boundaries

This is a focused MVP for a creative agency client portal. Preserve the product shape from the context brief:

- Keep the UI minimal, neutral, and rebrandable.
- Use one universal project shell with service templates.
- Keep the timeline macro-level only.
- Make deliverables the operational center.
- Keep revision loops inside deliverable cards.
- Use Google Drive or external links for heavy creative assets.
- Use Supabase magic-link authentication for clients.
- Let the team control project activation after payment confirmation.

Do not add chat, billing, invoicing, heavy file hosting, annotation tooling, a mobile app, advanced analytics, or a generalized ERP surface unless the product brief is explicitly updated.

## Technical Direction

- Next.js App Router with TypeScript.
- Tailwind CSS with neutral CSS variables for rebrandable styling.
- Supabase for auth, Postgres, RLS, and lightweight metadata.
- `@supabase/ssr` for server-compatible auth.
- Keep domain code in `features/*` and cross-cutting utilities in `lib/*`.
- Keep reusable visual primitives in `components/*`.
- Prefer simple typed modules over premature abstractions.

## Working Rules

- Read `docs/context.md` first in every session.
- Preserve MVP simplicity and folder boundaries.
- Update `docs/implementation-plan.md` when major architecture decisions change.
- Add or update local README files when creating significant subsystems.
- Do not hardcode secrets, hosted Supabase credentials, or agency-specific assumptions.
- Keep documents and deliverable assets as external URLs for v1.
- Add RLS for every new table in Supabase migrations.

## Current Architecture Notes

- `app/(team)/admin` is the internal team shell.
- `app/(client)/portal` is the client portal shell.
- `app/(auth)/login` handles magic-link login foundations.
- `lib/supabase` separates browser, server, and middleware Supabase clients.
- Placeholder UI can use demo data only while Supabase environment variables are missing.

# Folder Guide

## `app`

Next.js App Router routes. Route groups separate public, auth, team, and client areas without changing URLs.

- `app/page.tsx`: public SaaS landing page.
- `app/register`: agency registration and post-magic-link completion.
- `app/dev-entry`: internal testing shortcuts formerly shown on the home page.

Do not put domain-heavy business logic here. Pages should compose feature modules, layout components, and server actions.

## `components`

Reusable UI and layout primitives.

- `components/ui`: low-level shadcn-compatible primitives.
- `components/layout`: app shells, navigation, page headers.
- `components/shared`: cross-feature display pieces.
- `components/project`: project summary and timeline UI.
- `components/deliverables`: deliverable cards and status UI.
- `components/documents`: document list UI.
- `components/responsibilities`: responsibility matrix UI.
- `components/plans`: plan comparison card UI.

Keep these components rebrandable and mostly presentation-focused.

## `features`

Domain modules for auth, clients, projects, templates, plans, deliverables, documents, notifications, responsibilities, and timeline.

Feature folders own domain types, queries, server actions, validators, and local README notes when a module grows.

Current project flow actions live in `features/projects/actions.ts`; read and extend those before adding new mutation locations.

## `lib`

Cross-cutting utilities.

- `lib/supabase`: Supabase clients and auth glue.
- `lib/auth`: session and role helpers.
- `lib/db`: shared data access helpers.
- `lib/utils`: small general utilities.
- `lib/validators`: shared Zod schemas.

Do not put route-specific UI in `lib`.

## `types`

Shared TypeScript types, including generated Supabase database types when available.

- `types/database.generated.ts` is generated from the linked hosted Supabase project.
- `types/database.types.ts` re-exports the generated database types for stable imports.

## `supabase`

Local Supabase project files.

- `supabase/config.toml`: CLI local development config.
- `supabase/migrations`: committed schema migrations.
- `supabase/seed`: local development seed data.

Every new table should include RLS policies in the same migration or a follow-up migration.

Hosted schema changes should be applied through committed migrations with `npx supabase db push`, not by ad hoc dashboard edits.

## `scripts`

Small developer verification scripts. `scripts/check-supabase-env.mjs` validates required Supabase env variables and performs a masked hosted schema check without printing secrets.

`scripts/generate-supabase-types.mjs` regenerates `types/database.generated.ts` from the linked hosted project using UTF-8 output.

## `docs`

Persistent project context, implementation notes, folder guidance, and future handoff documentation.

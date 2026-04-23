# Creative Agency Client Portal

A minimal MVP foundation for a creative agency client portal built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

The product focuses on team-controlled project activation, macro project visibility, deliverables, lightweight revisions, documents, responsibilities, and client magic-link login. It intentionally does not include chat, billing, heavy file hosting, or advanced ERP features.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth and Postgres
- Supabase SSR helpers via `@supabase/ssr`
- Zod for validation
- Lucide React for icons

## Prerequisites

- Node.js 20 or later
- Docker Desktop or another Docker-compatible container runtime
- Supabase CLI run with `npx supabase` or installed as a local dev dependency

Supabase currently recommends `npm install supabase --save-dev` for local dev dependency usage, or running the CLI with `npx supabase`. Global npm installation is not supported.

## Setup

```bash
npm install
cp .env.example .env.local
npx supabase start
npm run dev
```

On Windows PowerShell, if `npm` is blocked by execution policy, use:

```powershell
npm.cmd install
npm.cmd run dev
```

The app runs at `http://localhost:3000`.

Supabase Studio runs at `http://localhost:54323` after `npx supabase start`.

## Environment

Copy `.env.example` to `.env.local` and fill in values from `npx supabase start`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF`
- `NEXT_PUBLIC_APP_URL`
- `ADMIN_BOOTSTRAP_EMAILS`

Do not commit real secrets.

For hosted Supabase, use the same variable names. `NEXT_PUBLIC_SUPABASE_URL` must be the hosted project URL, `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be the public anon key, and `SUPABASE_SERVICE_ROLE_KEY` must stay server-only. The app validates malformed or placeholder values at startup boundaries.

`ADMIN_BOOTSTRAP_EMAILS` is a comma-separated allowlist for the first team owner claim, for example `owner@agency.com,ops@agency.com`. In production, set this before anyone uses `/admin/bootstrap`. Local development allows bootstrap without this variable so fresh local databases are not blocked.

Run a masked connection check:

```bash
npm run supabase:check
npm run supabase:types
```

This command prints presence/status only. It does not print secrets.

## Hosted Supabase Later

When you create your hosted Supabase project or need to re-link this repo:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
npm run supabase:types
```

Then replace local environment values with hosted project values in your deployment provider.

If the CLI reports that no access token is provided, run `npx supabase login` or set `SUPABASE_ACCESS_TOKEN` before hosted `db push` or type generation.

After an allowlisted first team user signs in, open `/admin/bootstrap` and claim first owner access. This creates the initial agency workspace owner and then locks itself once an owner exists.

## Auth Model

The app uses one Supabase magic-link mechanism for both team and client users. The app decides who may receive a magic link before asking Supabase to send one:

- Unknown emails are denied and are not auto-created by OTP.
- First owner bootstrap is allowed only while no owner exists and the email is in `ADMIN_BOOTSTRAP_EMAILS` in production.
- Team access requires a `profiles` row with `user_type = team`, a `team_role`, and an `organization_id`.
- Client access requires a `profiles` row with `user_type = client` plus an explicit `client_users` membership.
- Project activation creates or updates the primary client contact auth user/profile and `client_users` membership.
- `/admin` and `/portal` are protected server-side by middleware and database RLS.

## Scripts

```bash
npm run dev
npm run dev:webpack
npm run build
npm run build:webpack
npm run lint
npm run typecheck
npm run supabase:check
npm run verify:deliverable-revisions
```

If Windows Application Control blocks Next's native SWC binary, use the installed WASM fallback with Webpack:

```powershell
$env:NEXT_TEST_WASM='1'
$env:NEXT_TEST_WASM_DIR="$PWD\node_modules\@next\swc-wasm-nodejs"
npm.cmd run dev:webpack
npm.cmd run build:webpack
```

## Important Docs

- `AGENTS.md`: required operating guide for future Codex sessions
- `docs/context.md`: product context and MVP boundaries
- `docs/implementation-plan.md`: phased architecture plan
- `docs/folder-guide.md`: purpose of major folders
- `supabase/README.md`: local Supabase workflow

## Current Status

This repo is an MVP foundation. It now includes route shells, generated Supabase database types, typed domain models, Supabase schema/config, seed data migrations, auth helpers, neutral UI primitives, first-owner bootstrap, draft project creation, payment confirmation, activation controls, pause/archive project state controls, deliverable creation, client deliverable approval, atomic revision requests, admin resubmission, and admin approval on behalf of clients.

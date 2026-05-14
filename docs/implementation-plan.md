# Implementation Plan

## Architecture Summary

This repo is a single SaaS-ready Next.js App Router application. It uses route groups to separate public, auth, team, and client areas while sharing one organization-scoped domain model and one reusable component system.

- `app/page.tsx` contains the public SaaS landing page.
- `app/register` contains agency owner registration and completion.
- `app/dev-entry` contains internal route shortcuts for local testing.
- `app/(auth)` contains the single neutral magic-link sign-in route for existing team and client users.
- `app/(team)/admin` contains the internal team shell.
- `app/(client)/portal` contains the client portal shell.
- `components` contains reusable UI and layout primitives.
- `features` contains domain-specific modules.
- `lib/supabase` contains SSR, browser, and middleware Supabase clients.
- `supabase` contains local CLI config, migrations, and seed data.

Supabase is the persistence and auth layer. The schema starts with RLS enabled and models organizations, organization memberships, profiles, client users, clients, templates, draft and activated projects, macro phases, deliverables, comments, approvals, documents, responsibility rows, and notification events.

The app uses one Supabase project for many agencies. Agency-owned tables carry or inherit `organization_id`, and RLS resolves team access through `organization_members` plus explicit client access through `client_users`.

## Phases

### Phase 1: Foundation

- Initialize the Next.js App Router project.
- Add TypeScript, Tailwind, ESLint, path aliases, and neutral design tokens.
- Create durable docs and folder guidance.
- Add Supabase config and environment templates.

### Phase 2: Database and Auth

- Add schema migration with enums, tables, indexes, triggers, and RLS policies.
- Add seed data for templates and a demo project.
- Wire Supabase SSR, browser, and middleware helpers.
- Add magic-link login foundation.

### Phase 3: Core Domain Shells

- Add team admin dashboard shell.
- Add clients, projects, templates, and project detail shells.
- Add client portal overview and project detail shells.
- Use demo data when Supabase is not configured.

### Phase 4: Activation and Deliverables

- Implement draft project creation.
- Implement payment confirmed state.
- Implement team-controlled activation.
- Implement deliverable CRUD, approval, revision request, and approval-on-behalf flows.

### Phase 5: Documents and Responsibilities

- Implement document metadata CRUD with external links.
- Implement responsibility matrix CRUD.
- Add optional calendar module placeholder for recurring templates.

### Phase 6: Handoff Polish

- Add empty states, loading states, and error handling.
- Generate database types from Supabase.
- Expand README and local folder notes as workflows mature.

## Implemented Now

- Documentation and operating guidance.
- Next.js app skeleton and route shells.
- Supabase local config, schema migration, and seed strategy.
- Auth helper foundation for magic-link login and SSR sessions.
- Hosted Supabase environment validation and masked connection check.
- Generated Supabase database types from the linked hosted project.
- Real Supabase query/action layer with schema-missing error states.
- First team-owner bootstrap route at `/admin/bootstrap`.
- Invite/allowlist based magic-link gate that prevents unknown email auto-signup.
- Server-side route protection based on resolved database role and client membership.
- SaaS public home page, `/register` agency signup, and `/register/complete` magic-link onboarding.
- Neutral `/login` entry that routes by database membership after magic-link authentication instead of asking users to choose team or client up front.
- `organization_members` as the durable team membership model, with `profiles.organization_id` and `profiles.team_role` retained as compatibility mirrors.
- Organization-scoped child rows for phases, deliverables, deliverable comments, approvals, documents, responsibilities, client memberships, and notification events.
- Paladar represented as the first organization (`paladar`) with `rangercardeal@gmail.com` seeded as the owner invitation/bootstrap candidate.
- Draft project creation, deal status, payment confirmation, and activation controls.
- Main project state controls for draft, active, paused, and archived projects, including archive reasons.
- Template default macro phases now populate new draft project timelines.
- Admins can manually set macro phases active or complete from the project detail page; multiple phases may stay active when work overlaps.
- Admin and client project timelines default to a node-based flow view with the card/block timeline kept as an alternate display mode; client timelines are read-only.
- Responsibility matrices support agency, client, external, and shared ownership. Admins can add/update/delete rows; clients see the matrix read-only.
- Responsibility add forms use template-aware preset title dropdowns; custom projects combine presets across all MVP templates.
- Draft project creation can optionally include a starter responsibility matrix; projects without one show an admin warning until resolved.
- Deliverable creation, client approval, atomic client revision request, admin resubmission, and admin approval-on-behalf actions.
- Phase-aware documents with grouped presentation, admin phase assignment, and timeline links that filter or focus the related section.
- Minimal neutral UI primitives and layout components.
- Team-created service templates with a custom macro timeline builder based on the standard phase nodes.
- Draft project creation handoff that routes custom template selection through the template builder and resumes the draft form afterward.
- Project document grouping and document phase options now follow the actual project timeline phase order when a custom template changes it.
- SaaS plan tiers on organizations: Free, Medium, and Premium.
- Public `/pricing` plan comparison and admin `/admin/billing` plan usage page.
- Server-side draft project limit enforcement based on non-archived project count.
- Paladar is treated as Premium with `subscription_status = manual`.
- Public token-based proposal approval links at `/proposal/[token]` for pre-activation client approval.

## Later

- Email provider integration for notification events.
- Granular role management UI.
- Stripe checkout, Stripe webhooks, and provider-backed subscription/paywall enforcement.
- Document edit/delete controls.
- Template editing UI for custom deliverable suggestions and responsibility presets.

## Hosted Supabase Status

The app expects:

- `APP_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF` for CLI convenience
- `ADMIN_BOOTSTRAP_EMAILS` for first-owner production bootstrap

The hosted project is linked and reachable with the configured URL/key pair. Apply committed migrations with `npx supabase db push`, then regenerate linked types with:

```bash
npm run supabase:types
```

Run `npm run supabase:check` after schema changes to verify the hosted project without printing secrets.

Production magic-link redirects must use configured app URLs only. On Render, set both `APP_URL` and `NEXT_PUBLIC_APP_URL` to `https://vault-fosv.onrender.com`; do not derive Supabase email redirect URLs from request host headers because Render may expose its internal `localhost:10000` port.

The SaaS plan migration is `supabase/migrations/202605050001_saas_plan_tiers.sql`. Push it before relying on hosted project limits:

```bash
npx supabase db push
npm run supabase:types
```

## Production Auth Model

The app keeps a single Supabase magic-link auth mechanism. Before a link is sent, server actions resolve the email against the database:

- First owner: allowed only while no team owner exists and the email is in `ADMIN_BOOTSTRAP_EMAILS` in production.
- Team users: allowed only through an active `organization_members` row or pending team invitation.
- Client users: allowed only through explicit `client_users` membership or a pending client invitation.
- Unknown users: denied before Supabase OTP is called; OTP uses `shouldCreateUser: false`.
- Post-login routing resolves the user's profile and membership instead of trusting raw email or requested path.
- Middleware protects `/admin` with organization membership checks and `/portal` with team-preview or client-membership checks.
- New agencies register through `/register`; completion creates the organization, profile, owner membership, and default organization templates after magic-link authentication.
- New agencies start on the Free plan. Plan upgrades are currently manual placeholders from `/admin/billing`; real payments are still out of scope.
- Existing agency members and clients both enter through `/login`; the app sends team users to `/admin` and client users to `/portal`.

## Open Questions

- What email sender domain will be used for magic links and notification events?
- Which approval sources should be exposed first for admin approval on behalf of clients?
- Should proposal approval links live under `/proposal/[token]` or a branded client-specific URL later?
- Which agency brand tokens should replace the neutral MVP palette?

# Supabase

This folder contains the local Supabase project configuration, migrations, and seed data.

## Local Workflow

Install the CLI as a local dev dependency or run it with `npx`:

```bash
npm install
npx supabase start
npx supabase db reset
```

Supabase local development requires Docker Desktop or another Docker-compatible runtime.

After `npx supabase start`, copy the local API URL and anon key into `.env.local`.

Run the app-level connection check with:

```bash
npm run supabase:check
```

## Hosted Project Later

Create a hosted Supabase project, then run:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
npm run supabase:types
```

Keep secrets in `.env.local` or your deployment provider. Do not commit real keys.

If secrets were ever committed to `.env.example`, rotate the anon and service role keys in Supabase before continuing.

## Schema Notes

- RLS is enabled on all app tables.
- Team users can manage records in their organization.
- Client users can read only their own activated projects.
- Deliverable revision and approval state lives on deliverables and related comment/approval tables.
- Documents store metadata and external links, not heavy uploaded assets.

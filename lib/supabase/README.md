# Supabase Utilities

This folder separates Supabase clients by runtime:

- `browser.ts` for client components.
- `server.ts` for server components, route handlers, and server actions.
- `middleware.ts` for session refresh and protected routes.
- `env.ts` for environment checks.
- `admin.ts` for service-role-only server utilities.

Do not import server helpers into client components.

Required variables are validated centrally:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for server-only admin operations

Never expose the service-role key in browser code.

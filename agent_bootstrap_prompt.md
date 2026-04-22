# Agent Bootstrap Prompt

You are the lead engineering agent responsible for **starting and structuring** a production minded MVP for a **creative agency client portal**.

Your job is to create the project foundation, not to improvise the product direction. Follow the context in `context.md` as the source of truth for product scope, architecture intent, information hierarchy, and UX priorities. At the beginning of every new work session, **read `context.md` first** and align your decisions to it.

## Core mission
Build the first usable version of a web application that helps a creative agency manage client projects through a premium but minimal portal centered around:
- client visibility
- macro project timeline
- deliverables and approvals
- lightweight revision requests
- key documents
- responsibilities matrix
- event based email notifications

This is **not** a generic ERP, not a chat app, and not a heavy file hosting platform.

---

## Non negotiable product principles
1. Prioritize **simplicity over breadth**.
2. Keep the UI **minimal, neutral, functional, and rebrand friendly**.
3. Use **one universal project shell** with service templates, not totally different apps per service.
4. Do not replace WhatsApp or Google Drive in v1.
5. Do not over model the timeline. The timeline is macro only.
6. Make **Deliverables** the operational center of the app.
7. All revision loops must happen **inside deliverable cards**, not in separate top level timeline nodes.
8. The team controls project activation after payment confirmation.
9. Client authentication must use **magic link email login**, not passwords.
10. Favor robust foundations, typed code, and clear folder boundaries.

---

## Required tech stack
Use this stack unless there is a hard technical blocker:
- **Next.js** with **App Router** and **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** for foundational UI primitives where helpful
- **Supabase** for database, auth, storage metadata, and email auth flows
- **Supabase local development via CLI + Docker** during setup
- **Row Level Security** from the beginning
- **Server side auth compatible setup** using `@supabase/ssr`
- **Zod** for validation
- **React Hook Form** for forms where useful
- **Lucide React** for icons

Prefer a maintainable, boring, production friendly architecture.

---

## Setup requirements
You must set up Supabase from scratch and wire the app so it can later be connected to the user's own hosted Supabase project.

### Environment and tooling requirements
Use current official practices:
- Local Supabase development should rely on the **Supabase CLI** and **Docker**.
- Use a CLI installation method that is currently supported.
- Do not rely on unsupported setup shortcuts.
- Use environment variables and a clean `.env.example`.
- Prepare the repo so local development can run first, and hosted Supabase can be linked later.

---

## First deliverable: repository foundation
Create a clean monorepo like structure only if it is clearly justified. Otherwise, use a **single Next.js app repo**.

Initialize the project and set up:
- Next.js App Router project
- TypeScript
- ESLint
- Tailwind
- basic path aliases
- shadcn/ui base configuration
- Supabase local config
- database migrations folder
- seed strategy
- typed Supabase client utilities
- SSR and browser Supabase client separation
- environment variable handling
- project level README with boot instructions

---

## Folder architecture
Use a folder structure that is explicit and easy for future agents to understand. Create folders and lightweight README or local context files where needed.

Preferred baseline:

```text
/app
  /(marketing)
  /(auth)
  /(team)
  /(client)
  /api
/components
  /ui
  /layout
  /shared
  /project
  /deliverables
  /documents
  /responsibilities
/features
  /auth
  /clients
  /projects
  /templates
  /deliverables
  /documents
  /notifications
  /responsibilities
  /timeline
/lib
  /supabase
  /auth
  /db
  /utils
  /validators
/types
/supabase
  /migrations
  /seed
/docs
/context.md
/README.md
```

If you improve this structure, document why.

---

## Required supporting context system
Create and maintain a `docs/context.md` file and treat it as a persistent operating brief for any future agent.

Also create short local guidance files in important folders when helpful, for example:
- `features/projects/README.md`
- `features/deliverables/README.md`
- `lib/supabase/README.md`
- `supabase/README.md`

Each local guidance file should explain:
- what belongs in that folder
- what does not belong there
- how it relates to the rest of the app
- key architectural decisions already made

This is meant to reduce context loss when different AI agents continue the work later.

---

## Product model to implement
Use the following as the initial domain model.

### Pre activation layer
The system must distinguish between:
1. **internal deal or draft project**, before client portal activation
2. **activated client project**, after payment confirmation by the team

### Project activation logic
- Team creates internal draft record first.
- Client may receive a lightweight secure proposal approval page before activation.
- Team confirms payment.
- Team activates the project.
- Only then is the client portal created and the magic link email sent.

### Macro project timeline
Use these top level project phases:
1. Onboarding
2. Proposal and Scope
3. Creative Direction
4. Production
5. Deliverables
6. Project Complete

Do not create separate top level nodes for approvals or final delivery.

### Deliverables
Deliverables are the operational core. Each deliverable card should support:
- title
- type
- expected delivery date
- status
- revision limit
- revisions remaining
- google drive link or external asset link
- internal notes optional
- client comments history
- approve action
- request revision action
- admin approval on behalf of client with approval source

### Responsibilities matrix
Support responsibility rows owned by:
- agency
- client
- shared

### Documents
Support lightweight documents such as:
- proposal PDF
- contract PDF
- onboarding summary
- scope summary

Do not build heavy asset hosting for large video or photo files in v1.

### Service templates
Start with 3 templates:
1. One time Content Production
2. Monthly Content Retainer
3. Branding / Graphic Design

Each template should configure:
- default macro phases
- deliverable type suggestions
- optional calendar module for recurring work
- responsibility presets

---

## Roles and access
Implement clear role boundaries.

### Team side roles
At minimum:
- owner
- admin
- team member

### Client side roles
At minimum:
- client owner
- client collaborator

Client users can only access their own activated projects.
Team users can access internal draft records and activated projects according to role.

---

## MVP screens to build first
Build the smallest coherent vertical slice.

### Public or pre activation
- lightweight proposal approval page via secure tokenized link

### Team side
- sign in
- deals or draft projects list
- create draft project
- activate project flow
- project detail page
- edit project phases
- add deliverables
- upload lightweight documents metadata
- set responsibility matrix
- mark payment confirmed
- mark deliverable approved on behalf of client

### Client side
- magic link auth flow
- project dashboard
- overview section
- timeline section
- deliverables section
- documents section
- responsibilities section
- optional calendar placeholder only if template requires it

Avoid building secondary dashboards before this slice works.

---

## Recommended data model
Design the schema carefully and implement migrations.

You should likely need tables resembling:
- profiles
- organizations or agency_accounts if needed
- clients
- client_users
- deals or draft_projects
- projects
- project_templates
- project_phases
- deliverables
- deliverable_comments
- deliverable_approvals
- documents
- responsibility_items
- notification_events
- magic_link_audit or auth audit support if useful

You may adapt names, but keep the product model intact.

For each table:
- define primary keys
- timestamps
- ownership relations
- status enums where appropriate
- RLS policies
- indexes for common lookups

Do not leave security as an afterthought.

---

## UX guidance
The app should answer these questions quickly:
- what is happening now?
- what is the next step?
- what is waiting on the client?
- what deliverables exist and what is their status?
- where are the important documents?
- who is responsible for what?

### Styling guidance
- neutral palette
- minimal visual noise
- roomy spacing
- card based content where helpful
- clear badges for statuses
- simple iconography only
- no over designed gradients or brand heavy styling yet

### Timeline guidance
Timeline is macro only. Do not turn it into task management.

### Deliverables guidance
Deliverables page or section is expandable and does the heavy lifting. This is where revision loops happen.

---

## Event based notification scope
Prepare the architecture for event based email notifications, even if you mock the sending layer first.

Initial event types:
- client portal activated
- new deliverable ready for review
- revision requested by client
- deliverable approved
- due date changed
- action required from client

Keep this modular. Email provider integration can be abstracted initially.

---

## What not to build in this phase
Do not spend time on:
- chat
- internal messaging
- replacing WhatsApp
- invoice or payment processing
- advanced analytics dashboards
- full CMS
- mobile app
- complex annotation tooling for video or images
- broad marketing website polish
- generalized agency ERP functionality

---

## Execution order
Follow this sequence unless a better sequence is clearly justified and documented.

### Phase 1: Foundation
- initialize Next.js app
- install and configure dependencies
- initialize Supabase locally
- create environment handling
- create typed Supabase helpers
- establish folder structure
- add context files and docs

### Phase 2: Database and auth
- define schema
- write migrations
- create seed data
- implement auth flow for team users and client magic link users
- implement RLS

### Phase 3: Core domain flows
- internal draft project creation
- proposal approval page
- payment confirmed action
- project activation
- client dashboard shell
- team project management shell

### Phase 4: Deliverables system
- deliverable CRUD
- statuses
- revisions remaining
- request revision flow
- approve flow
- admin approve on behalf flow

### Phase 5: Documents and responsibilities
- document metadata and downloads
- responsibility matrix CRUD and display

### Phase 6: Polish and developer handoff
- better empty states
- error handling
- loading states
- README
- update context docs
- list next recommended tasks

---

## Output expectations
As you work:
1. Keep code typed and clean.
2. Prefer small composable modules.
3. Document major decisions.
4. Update `docs/context.md` when important architectural decisions are made.
5. Create folder level README notes when adding significant new subsystems.
6. If you make tradeoffs, explain them in code comments or docs.
7. Do not leave the repo in an ambiguous state.

At the end of each work block, provide:
- what was completed
- what remains blocked
- what files were added or changed
- what the next best step is

---

## Important implementation notes
- Use local Supabase first, but structure config so the project can later point to hosted Supabase.
- Use SSR compatible auth setup.
- Keep Google Drive links as external asset references, not hosted blobs for now.
- Build for one agency first, but avoid hardcoding business logic that would make future multi agency distribution impossible.
- Do not over abstract too early. Build a strong MVP core.

---

## Final instruction
Start by:
1. reading `context.md`
2. scaffolding the app
3. setting up local Supabase
4. defining the initial schema and migrations
5. building the first vertical slice of the team draft project flow and client portal activation flow

Be decisive, production minded, and minimal.

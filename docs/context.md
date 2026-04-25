# Context

## Project Name

Creative Agency Client Portal

## Product Summary

This project is a SaaS-ready web application for creative and marketing agencies to manage the operational relationship with clients through a simple, premium, minimal portal.

The app centralizes client visibility, macro timeline status, deliverables, approvals, lightweight revision handling, key documents, and responsibility ownership between the agency and the client.

This is not a generic ERP, not a chat platform, and not a heavy file hosting system.

The product runs as one shared application backed by one Supabase project. Many agencies live inside the same database as separate organizations, and every agency-owned record must be isolated by organization membership and RLS.

## Product Goal

Create a minimal but robust portal where a client can always understand:

- what phase the project is in
- what is currently happening
- what deliverables exist
- what needs review or approval
- what documents matter
- who is responsible for what
- what happens next

## Product Principles

- Keep it simple, minimal, functional, and rebrand friendly.
- Use one universal project shell with service templates.
- Do not replace WhatsApp in v1.
- Do not host heavy creative files in v1.
- Use Google Drive links or external asset links for large deliverables.
- Keep the timeline macro only.
- Make deliverables the operational center.
- Use magic-link email authentication for clients.
- Let the team control project activation after payment confirmation.

## User Groups

### Team Users

Internal agency users belong to an organization and create draft projects, manage activation, configure deliverables, add documents, assign responsibilities, and trigger notification events inside that organization.

Team roles:

- owner
- admin
- team member

### Client Users

External users log in to view activated projects, review deliverables, request revisions, approve items, and access documents.

Client roles:

- client owner
- client collaborator

Client users can only access their own activated projects.

## Product Split

### Public SaaS Layer

The public layer supports:

- minimal product landing page
- agency owner registration
- magic-link completion for creating the first organization owner
- sign-in routing into the correct member area

### Team Panel

The internal backoffice supports:

- draft project setup
- proposal and contract preparation
- payment confirmation
- project activation
- pipeline and deliverable setup
- responsibility matrix setup
- document metadata management
- approval management
- notification event preparation

### Client Portal

The external portal supports:

- project overview
- macro timeline
- deliverables review
- revision requests
- approvals
- document access
- responsibility visibility
- optional calendar placeholder for recurring retainers

## Pre-Activation Versus Activated Project

Before payment is confirmed, there is no full client portal. The team creates an internal draft project with client details, service type, proposal/contract links, onboarding notes, scope summary, draft deliverables, and payment status.

The client may receive a lightweight secure proposal approval page before activation.

After payment or deposit is confirmed, the team activates the project. Only then is the client portal created, a magic-link email sent, and the official project timeline started.

## Macro Pipeline

Top-level phases:

1. Onboarding
2. Proposal and Scope
3. Creative Direction
4. Production
5. Deliverables
6. Project Complete

Do not add top-level timeline nodes for approvals or final delivery. Revision loops belong inside deliverables.

## Deliverables

Deliverables are the operational heart of the app.

Each deliverable should support:

- title
- type
- expected delivery date
- status
- revision limit
- revisions remaining
- Google Drive link or external asset link
- internal notes
- client comment history
- approve action
- request revision action
- admin approval on behalf of client with approval source logging

Deliverable statuses:

- planned
- in progress
- ready for review
- revision requested
- approved
- delivered

When a client requests a revision, they submit a comment, revisions remaining decrement, the deliverable status changes to revision requested, and a notification event is recorded.

## Documents

Documents are lightweight metadata records with external links. Examples:

- proposal PDF
- contract PDF
- onboarding summary
- scope summary

Documents should carry a simple phase association so onboarding, proposal and scope, creative direction, production, deliverables, and general references do not collapse into one flat list.

Do not build heavy media hosting in v1.

## Responsibilities

Responsibility rows can be owned by:

- agency
- client
- external
- shared

Use external when a contractor, partner, or outside collaborator owns the work. Common rows include content planning, shooting, editing, scheduling, publishing, community management, paid ads setup, paid ads management, and reporting.

## Service Templates

Start with three templates:

1. One time Content Production
2. Monthly Content Retainer
3. Branding / Graphic Design

Templates configure default macro phases, deliverable type suggestions, optional calendar support, and responsibility presets.

## Notifications

Notifications are event based and email-ready, but provider integration can stay abstract in the MVP.

Initial event types:

- client portal activated
- new deliverable ready for review
- revision requested by client
- deliverable approved
- due date changed
- action required from client

## UX Direction

The interface should answer quickly:

- what is happening now?
- what is next?
- what is waiting on me?
- where are the latest deliverables?
- what has already been approved?
- where are the important documents?
- who is responsible for each part?

Visual style should stay neutral, minimal, functional, and roomy with clear badges and simple cards where useful.

## Technical Direction

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible component structure
- Supabase auth, Postgres, RLS, and local development
- `@supabase/ssr`
- Zod for validation
- React Hook Form where forms become non-trivial
- Lucide React for icons

## Multi-Tenant Direction

- Use one Render web service and one Supabase project for all agencies.
- Keep agencies in `organizations`.
- Resolve team access through `organization_members`, not email alone.
- Keep client access explicit through `client_users`.
- Scope clients, projects, templates, phases, deliverables, documents, responsibilities, comments, approvals, and notification events to an organization.
- Preserve Paladar as the first real agency instance, with `rangercardeal@gmail.com` as the owner/admin candidate.
- Keep Stripe and payment enforcement out of the MVP until billing is explicitly planned.

## Future Agent Rules

1. Read this file first.
2. Extend the universal shell instead of inventing one-off flows.
3. Keep timeline logic macro-level.
4. Put operational review logic inside deliverables.
5. Keep Google Drive links as external references.
6. Update docs when major decisions change.
7. Leave the repo easier to understand than you found it.

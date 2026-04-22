# Context

## Project name
Creative Agency Client Portal

## Product summary
This project is a web application for a creative agency to manage the operational relationship with clients through a simple and premium portal.

The app is designed to centralize visibility, deliverables, approvals, lightweight revision handling, key documents, and responsibility ownership between the agency and the client.

This is not a generic ERP and not a chat platform. It is a focused client operations layer for creative work.

---

## Problem being solved
Today the agency workflow is fragmented across WhatsApp, email, PDFs, and Google Drive. Important information gets lost, clients repeatedly ask for status updates, approvals are ambiguous, and responsibilities are not always clear.

The app should solve:
- scattered communication
- weak project visibility for clients
- repetitive status chasing
- unclear approvals and revision handling
- poor scope and responsibility clarity
- unprofessional project follow up experience

---

## Product goal
Create a minimal but robust portal where a client can always understand:
- what phase the project is in
- what is currently happening
- what deliverables exist
- what needs review or approval
- what documents matter
- who is responsible for what
- what happens next

---

## Product style and principles
- keep it simple
- keep it minimal
- keep it functional
- keep it rebrand friendly
- one universal product shell
- no heavy custom dashboards per service
- do not replace WhatsApp in v1
- do not host heavy creative files in v1
- use Google Drive links for large assets
- timeline is macro only
- deliverables are the operational center
- client authentication uses magic links
- team controls project activation after payment confirmation

---

## Main user groups
### Team users
Internal agency users who create and manage draft projects, activate client portals, manage deliverables, documents, responsibilities, and project states.

### Client users
External users who log in to view their project, review deliverables, request revisions, approve items, and access documents.

---

## Core product split
The app has two main sides:

### Team panel
Internal backoffice for:
- draft project setup
- proposal and contract preparation
- payment confirmation
- project activation
- pipeline and deliverable setup
- responsibility matrix setup
- document management
- approvals management
- notification triggering

### Client panel
External portal for:
- project overview
- macro timeline
- deliverables review
- revision requests
- approvals
- document access
- responsibility visibility
- calendar visibility for recurring services if applicable

---

## Pre activation versus activated project
This is a key product decision.

### Pre activation
Before payment is confirmed, there is no full client portal.
Instead, the team creates an **internal draft project**.

This draft can contain:
- client details
- service type
- proposal
- contract
- onboarding notes
- scope summary
- draft deliverables
- payment status

The client may receive a lightweight secure proposal approval page before activation.

### Activation
After payment or deposit is confirmed by the team, the team activates the project.
Only then:
- the client project portal is created
- the client receives a magic link login email
- the official project timeline begins

The team, not the client, controls activation.

---

## Pipeline
The macro project pipeline is intentionally simple.

### Top level phases
1. Onboarding
2. Proposal and Scope
3. Creative Direction
4. Production
5. Deliverables
6. Project Complete

### Notes
- Do not create separate top level nodes for Approvals or Final Delivery.
- Revision loops happen inside Deliverables.
- Timeline is for macro visibility only.
- Production may be detailed internally but simplified client side.

---

## Deliverables logic
Deliverables are the operational heart of the app.

Each deliverable card should include:
- title
- type
- expected delivery date
- status
- revisions allowed
- revisions remaining
- external link such as Google Drive
- comments history
- approve action
- request revision action
- optional internal notes
- optional admin approval on behalf of client with source logging

### Deliverable statuses
- Planned
- In Progress
- Ready for Review
- Revision Requested
- Approved
- Delivered

### Revision logic
When a client requests a revision:
- they submit a comment
- revisions remaining decrement
- deliverable status changes to Revision Requested
- the team receives a notification event

### Approval logic
The client can approve a deliverable.
The team can also mark an item approved on behalf of the client if approval happened through another channel like WhatsApp, call, or email. That action must be logged.

---

## Documents
The app should support lightweight project documents such as:
- proposal PDF
- contract PDF
- onboarding summary
- scope summary

Do not build heavy media hosting in v1.
Store metadata and links instead of large file payloads where possible.

---

## Responsibilities matrix
Every project should support a responsibilities section showing who owns which part of the work.

Possible ownership values:
- Agency
- Client
- Shared

Likely responsibility rows include:
- content planning
- shooting
- editing
- scheduling
- publishing
- community management
- paid ads setup
- paid ads management
- reporting

This is important for clarity because some clients want full service while others only want partial execution.

---

## Notifications
Notifications are event based only.
The app should be architected for email notifications for events such as:
- portal activated
- deliverable ready for review
- revision requested
- deliverable approved
- due date changed
- client action required

Do not over build notifications in v1.

---

## Service templates
Start with 3 presets.

### 1. One time Content Production
Use for:
- event coverage
- promo package
- one shoot
- campaign content batch

Typical deliverables:
- reels
- photos
- promo video
- aftermovie
- supporting assets

### 2. Monthly Content Retainer
Use for:
- monthly content production
- recurring content partnerships
- multi month service relationships

Special notes:
- may require a calendar module
- may involve repeated monthly cycles
- responsibility matrix is especially important for publishing and scheduling ownership

Typical deliverables:
- monthly reels
- monthly photos
- captions
- story sets
- graphic assets

### 3. Branding / Graphic Design
Use for:
- logo
- identity system
- brand book
- social templates
- design assets

Typical deliverables:
- logo pack
- brand book
- templates
- color palette
- typography set
- graphics pack

---

## Access model
### Team roles
At minimum:
- owner
- admin
- team member

### Client roles
At minimum:
- client owner
- client collaborator

Client users must only access their own activated projects.

---

## UX guidance
The interface should answer these questions fast:
- what is happening now?
- what is next?
- what is waiting on me?
- where are the latest deliverables?
- what has already been approved?
- where are the important documents?
- who is responsible for each part?

### Visual direction
- neutral
- minimal
- functional
- clean spacing
- status badges
- card based sections where useful
- no heavy branding yet

---

## Technical direction
Preferred stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Supabase SSR auth setup
- Supabase local development first
- PostgreSQL via Supabase
- Row Level Security from the beginning

### File handling
Heavy deliverables should remain external, typically Google Drive.
The platform stores links and metadata.

---

## Architecture guidance for future agents
When working in this repo:
1. Read this file first.
2. Prefer extending the existing universal shell instead of inventing one off flows.
3. Do not overcomplicate the timeline.
4. Put operational review logic inside deliverables.
5. Keep docs updated when major decisions change.
6. Add local README files in important folders to explain boundaries.
7. Keep the product usable for one agency first, but avoid hardcoding the system beyond future reuse.

---

## Suggested important folders
- `app/` for route groups and pages
- `components/` for reusable UI
- `features/` for domain features
- `lib/supabase/` for clients, helpers, and auth glue
- `supabase/` for migrations and seed data
- `docs/` for persistent project context and architecture notes

Future agents should leave the repo easier to understand than they found it.

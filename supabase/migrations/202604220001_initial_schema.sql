create extension if not exists "pgcrypto";

create type public.user_type as enum ('team', 'client');
create type public.team_role as enum ('owner', 'admin', 'member');
create type public.client_role as enum ('client_owner', 'client_collaborator');
create type public.client_status as enum ('lead', 'active', 'archived');
create type public.deal_status as enum ('draft', 'proposal_sent', 'proposal_approved', 'payment_pending', 'payment_confirmed');
create type public.project_status as enum ('draft', 'proposal_sent', 'payment_confirmed', 'active', 'complete', 'archived');
create type public.activation_state as enum ('internal_draft', 'proposal_approved', 'payment_confirmed', 'activated');
create type public.phase_status as enum ('not_started', 'active', 'complete');
create type public.deliverable_status as enum ('planned', 'in_progress', 'ready_for_review', 'revision_requested', 'approved', 'delivered');
create type public.approval_source as enum ('client_portal', 'whatsapp', 'email', 'call', 'admin_override');
create type public.responsibility_owner as enum ('agency', 'client', 'shared');
create type public.notification_event_type as enum (
  'client_portal_activated',
  'deliverable_ready_for_review',
  'revision_requested_by_client',
  'deliverable_approved',
  'due_date_changed',
  'client_action_required'
);
create type public.notification_status as enum ('pending', 'sent', 'failed', 'skipped');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  email text not null unique,
  full_name text,
  user_type public.user_type not null default 'client',
  team_role public.team_role,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_role_required check (
    (user_type = 'team' and team_role is not null) or (user_type = 'client' and team_role is null)
  )
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  primary_contact_email text not null,
  status public.client_status not null default 'lead',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_users (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.client_role not null default 'client_collaborator',
  created_at timestamptz not null default now(),
  unique (client_id, profile_id)
);

create table public.project_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  supports_calendar boolean not null default false,
  default_phases jsonb not null default '[]'::jsonb,
  deliverable_type_suggestions text[] not null default '{}',
  responsibility_presets jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index project_templates_org_slug_idx
  on public.project_templates (coalesce(organization_id, '00000000-0000-0000-0000-000000000000'::uuid), slug);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  template_id uuid references public.project_templates(id) on delete set null,
  name text not null,
  summary text,
  service_type text,
  status public.project_status not null default 'draft',
  pre_activation_status public.deal_status not null default 'draft',
  activation_state public.activation_state not null default 'internal_draft',
  proposal_token uuid not null default gen_random_uuid(),
  proposal_approved_at timestamptz,
  payment_confirmed_at timestamptz,
  activated_at timestamptz,
  current_phase_key text,
  starts_on date,
  ends_on date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (proposal_token)
);

create table public.project_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  phase_key text not null,
  position integer not null,
  status public.phase_status not null default 'not_started',
  starts_on date,
  due_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, phase_key)
);

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  deliverable_type text not null,
  expected_delivery_date date,
  status public.deliverable_status not null default 'planned',
  revision_limit integer not null default 2 check (revision_limit >= 0),
  revisions_remaining integer not null default 2 check (revisions_remaining >= 0),
  external_url text,
  internal_notes text,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  approval_source public.approval_source,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint revisions_within_limit check (revisions_remaining <= revision_limit)
);

create table public.deliverable_comments (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references public.deliverables(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  author_name text,
  visibility text not null default 'client' check (visibility in ('client', 'team')),
  comment_type text not null default 'comment' check (comment_type in ('comment', 'revision_request')),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.deliverable_approvals (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references public.deliverables(id) on delete cascade,
  approved_by uuid references public.profiles(id) on delete set null,
  approval_source public.approval_source not null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  document_type text not null,
  external_url text not null,
  visible_to_client boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.responsibility_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  owner public.responsibility_owner not null,
  notes text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  deliverable_id uuid references public.deliverables(id) on delete cascade,
  event_type public.notification_event_type not null,
  status public.notification_status not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index profiles_org_idx on public.profiles (organization_id);
create index clients_org_idx on public.clients (organization_id);
create index client_users_profile_idx on public.client_users (profile_id);
create index projects_org_status_idx on public.projects (organization_id, status);
create index projects_client_idx on public.projects (client_id);
create index project_phases_project_idx on public.project_phases (project_id, position);
create index deliverables_project_status_idx on public.deliverables (project_id, status);
create index documents_project_idx on public.documents (project_id);
create index responsibilities_project_idx on public.responsibility_items (project_id, position);
create index notification_events_pending_idx on public.notification_events (status, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger clients_set_updated_at before update on public.clients
  for each row execute function public.set_updated_at();
create trigger project_templates_set_updated_at before update on public.project_templates
  for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger project_phases_set_updated_at before update on public.project_phases
  for each row execute function public.set_updated_at();
create trigger deliverables_set_updated_at before update on public.deliverables
  for each row execute function public.set_updated_at();
create trigger documents_set_updated_at before update on public.documents
  for each row execute function public.set_updated_at();
create trigger responsibility_items_set_updated_at before update on public.responsibility_items
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, user_type, team_role)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'full_name',
    coalesce((new.raw_user_meta_data->>'user_type')::public.user_type, 'client'),
    case
      when new.raw_user_meta_data->>'user_type' = 'team'
      then coalesce((new.raw_user_meta_data->>'team_role')::public.team_role, 'member')
      else null
    end
  )
  on conflict (id) do nothing;

  insert into public.client_users (client_id, profile_id, role)
  select c.id, new.id, 'client_owner'
  from public.clients c
  where lower(c.primary_contact_email) = lower(coalesce(new.email, ''))
  on conflict (client_id, profile_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_team_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and user_type = 'team'
      and organization_id = target_organization_id
  );
$$;

create or replace function public.is_team_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    join public.profiles pr on pr.organization_id = p.organization_id
    where p.id = target_project_id
      and pr.id = auth.uid()
      and pr.user_type = 'team'
  );
$$;

create or replace function public.is_client_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    join public.client_users cu on cu.client_id = p.client_id
    where p.id = target_project_id
      and cu.profile_id = auth.uid()
      and p.activation_state = 'activated'
      and p.status in ('active', 'complete')
  );
$$;

create or replace function public.can_access_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_team_project(target_project_id) or public.is_client_project(target_project_id);
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_users enable row level security;
alter table public.project_templates enable row level security;
alter table public.projects enable row level security;
alter table public.project_phases enable row level security;
alter table public.deliverables enable row level security;
alter table public.deliverable_comments enable row level security;
alter table public.deliverable_approvals enable row level security;
alter table public.documents enable row level security;
alter table public.responsibility_items enable row level security;
alter table public.notification_events enable row level security;

create policy "team can read own organizations" on public.organizations
  for select using (public.is_team_member(id));
create policy "authenticated users can create organizations" on public.organizations
  for insert with check (auth.uid() is not null);
create policy "team can update own organizations" on public.organizations
  for update using (public.is_team_member(id)) with check (public.is_team_member(id));

create policy "users can read own profile" on public.profiles
  for select using (id = auth.uid());
create policy "team can read profiles in organization" on public.profiles
  for select using (organization_id is not null and public.is_team_member(organization_id));
create policy "users can insert own profile" on public.profiles
  for insert with check (id = auth.uid());
create policy "users can update own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "team can manage clients" on public.clients
  for all using (public.is_team_member(organization_id)) with check (public.is_team_member(organization_id));
create policy "client users can read their client record" on public.clients
  for select using (
    exists (
      select 1 from public.client_users cu
      where cu.client_id = clients.id and cu.profile_id = auth.uid()
    )
  );

create policy "team can manage client users" on public.client_users
  for all using (
    exists (
      select 1
      from public.clients c
      where c.id = client_users.client_id and public.is_team_member(c.organization_id)
    )
  )
  with check (
    exists (
      select 1
      from public.clients c
      where c.id = client_users.client_id and public.is_team_member(c.organization_id)
    )
  );
create policy "client users can read own mapping" on public.client_users
  for select using (profile_id = auth.uid());

create policy "team can manage project templates" on public.project_templates
  for all using (organization_id is null or public.is_team_member(organization_id))
  with check (organization_id is null or public.is_team_member(organization_id));
create policy "authenticated users can read global templates" on public.project_templates
  for select using (organization_id is null);

create policy "team can manage projects" on public.projects
  for all using (public.is_team_member(organization_id)) with check (public.is_team_member(organization_id));
create policy "clients can read activated projects" on public.projects
  for select using (public.is_client_project(id));

create policy "project phases are readable by project members" on public.project_phases
  for select using (public.can_access_project(project_id));
create policy "team can manage project phases" on public.project_phases
  for all using (public.is_team_project(project_id)) with check (public.is_team_project(project_id));

create policy "deliverables are readable by project members" on public.deliverables
  for select using (public.can_access_project(project_id));
create policy "team can manage deliverables" on public.deliverables
  for all using (public.is_team_project(project_id)) with check (public.is_team_project(project_id));

create policy "comments are readable by project members" on public.deliverable_comments
  for select using (
    exists (
      select 1 from public.deliverables d
      where d.id = deliverable_comments.deliverable_id
        and public.can_access_project(d.project_id)
    )
  );
create policy "project members can add comments" on public.deliverable_comments
  for insert with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.deliverables d
      where d.id = deliverable_comments.deliverable_id
        and public.can_access_project(d.project_id)
    )
  );

create policy "approvals are readable by project members" on public.deliverable_approvals
  for select using (
    exists (
      select 1 from public.deliverables d
      where d.id = deliverable_approvals.deliverable_id
        and public.can_access_project(d.project_id)
    )
  );
create policy "project members can add approvals" on public.deliverable_approvals
  for insert with check (
    approved_by = auth.uid()
    and exists (
      select 1 from public.deliverables d
      where d.id = deliverable_approvals.deliverable_id
        and public.can_access_project(d.project_id)
    )
  );

create policy "team can manage documents" on public.documents
  for all using (public.is_team_project(project_id)) with check (public.is_team_project(project_id));
create policy "clients can read visible documents" on public.documents
  for select using (visible_to_client and public.is_client_project(project_id));

create policy "responsibilities are readable by project members" on public.responsibility_items
  for select using (public.can_access_project(project_id));
create policy "team can manage responsibilities" on public.responsibility_items
  for all using (public.is_team_project(project_id)) with check (public.is_team_project(project_id));

create policy "team can manage notification events" on public.notification_events
  for all using (public.is_team_member(organization_id)) with check (public.is_team_member(organization_id));

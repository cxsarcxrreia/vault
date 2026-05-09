alter table public.organizations
  add column if not exists plan_tier text not null default 'free',
  add column if not exists subscription_status text not null default 'manual';

alter table public.organizations
  drop constraint if exists organizations_plan_tier_check,
  add constraint organizations_plan_tier_check check (plan_tier in ('free', 'trial', 'manual'));

alter table public.organizations
  drop constraint if exists organizations_subscription_status_check,
  add constraint organizations_subscription_status_check check (subscription_status in ('free', 'trial', 'manual'));

update public.organizations
set
  name = 'Paladar',
  slug = 'paladar',
  plan_tier = 'manual',
  subscription_status = 'manual'
where id = '00000000-0000-0000-0000-000000000001';

insert into public.organizations (id, name, slug, plan_tier, subscription_status)
values ('00000000-0000-0000-0000-000000000001', 'Paladar', 'paladar', 'manual', 'manual')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  plan_tier = excluded.plan_tier,
  subscription_status = excluded.subscription_status;

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.team_role not null default 'member',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id),
  constraint organization_members_status_check check (status in ('active', 'inactive'))
);

create trigger organization_members_set_updated_at before update on public.organization_members
  for each row execute function public.set_updated_at();

insert into public.organization_members (organization_id, profile_id, role, status)
select organization_id, id, coalesce(team_role, 'member'::public.team_role), 'active'
from public.profiles
where user_type = 'team'
  and organization_id is not null
on conflict (organization_id, profile_id) do update set
  role = excluded.role,
  status = 'active';

alter table public.client_users
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade;

update public.client_users cu
set organization_id = c.organization_id
from public.clients c
where c.id = cu.client_id
  and cu.organization_id is null;

alter table public.client_users
  alter column organization_id set not null;

create index if not exists organization_members_profile_idx
  on public.organization_members (profile_id, status);
create index if not exists organization_members_org_role_idx
  on public.organization_members (organization_id, role, status);
create index if not exists client_users_org_profile_idx
  on public.client_users (organization_id, profile_id);

alter table public.project_phases
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.deliverables
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.deliverable_comments
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.deliverable_approvals
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.documents
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.responsibility_items
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade;

update public.project_phases pp
set organization_id = p.organization_id
from public.projects p
where p.id = pp.project_id
  and pp.organization_id is null;

update public.deliverables d
set organization_id = p.organization_id
from public.projects p
where p.id = d.project_id
  and d.organization_id is null;

update public.documents d
set organization_id = p.organization_id
from public.projects p
where p.id = d.project_id
  and d.organization_id is null;

update public.responsibility_items ri
set organization_id = p.organization_id
from public.projects p
where p.id = ri.project_id
  and ri.organization_id is null;

update public.deliverable_comments dc
set organization_id = d.organization_id
from public.deliverables d
where d.id = dc.deliverable_id
  and dc.organization_id is null;

update public.deliverable_approvals da
set organization_id = d.organization_id
from public.deliverables d
where d.id = da.deliverable_id
  and da.organization_id is null;

alter table public.project_phases alter column organization_id set not null;
alter table public.deliverables alter column organization_id set not null;
alter table public.deliverable_comments alter column organization_id set not null;
alter table public.deliverable_approvals alter column organization_id set not null;
alter table public.documents alter column organization_id set not null;
alter table public.responsibility_items alter column organization_id set not null;

create index if not exists project_phases_org_project_idx
  on public.project_phases (organization_id, project_id, position);
create index if not exists deliverables_org_project_status_idx
  on public.deliverables (organization_id, project_id, status);
create index if not exists deliverable_comments_org_deliverable_idx
  on public.deliverable_comments (organization_id, deliverable_id, created_at);
create index if not exists deliverable_approvals_org_deliverable_idx
  on public.deliverable_approvals (organization_id, deliverable_id, created_at);
create index if not exists documents_org_project_phase_idx
  on public.documents (organization_id, project_id, phase_key, created_at);
create index if not exists responsibilities_org_project_idx
  on public.responsibility_items (organization_id, project_id, position);

create or replace function public.set_project_child_organization_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select organization_id into new.organization_id
  from public.projects
  where id = new.project_id;

  if new.organization_id is null then
    raise exception 'Project organization is required.';
  end if;

  return new;
end;
$$;

create or replace function public.set_deliverable_child_organization_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select organization_id into new.organization_id
  from public.deliverables
  where id = new.deliverable_id;

  if new.organization_id is null then
    raise exception 'Deliverable organization is required.';
  end if;

  return new;
end;
$$;

drop trigger if exists project_phases_set_organization_id on public.project_phases;
create trigger project_phases_set_organization_id before insert or update of project_id on public.project_phases
  for each row execute function public.set_project_child_organization_id();

drop trigger if exists deliverables_set_organization_id on public.deliverables;
create trigger deliverables_set_organization_id before insert or update of project_id on public.deliverables
  for each row execute function public.set_project_child_organization_id();

drop trigger if exists documents_set_organization_id on public.documents;
create trigger documents_set_organization_id before insert or update of project_id on public.documents
  for each row execute function public.set_project_child_organization_id();

drop trigger if exists responsibility_items_set_organization_id on public.responsibility_items;
create trigger responsibility_items_set_organization_id before insert or update of project_id on public.responsibility_items
  for each row execute function public.set_project_child_organization_id();

drop trigger if exists deliverable_comments_set_organization_id on public.deliverable_comments;
create trigger deliverable_comments_set_organization_id before insert or update of deliverable_id on public.deliverable_comments
  for each row execute function public.set_deliverable_child_organization_id();

drop trigger if exists deliverable_approvals_set_organization_id on public.deliverable_approvals;
create trigger deliverable_approvals_set_organization_id before insert or update of deliverable_id on public.deliverable_approvals
  for each row execute function public.set_deliverable_child_organization_id();

create table if not exists public.agency_registrations (
  id uuid primary key default gen_random_uuid(),
  agency_name text not null,
  owner_name text,
  owner_email text not null,
  owner_email_normalized text generated always as (lower(trim(owner_email))) stored,
  status text not null default 'pending',
  organization_id uuid references public.organizations(id) on delete set null,
  accepted_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agency_registrations_status_check check (status in ('pending', 'accepted', 'revoked'))
);

create unique index if not exists agency_registrations_pending_email_idx
  on public.agency_registrations (owner_email_normalized)
  where status = 'pending';

create trigger agency_registrations_set_updated_at before update on public.agency_registrations
  for each row execute function public.set_updated_at();

alter table public.organization_members enable row level security;
alter table public.agency_registrations enable row level security;

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.profile_id = auth.uid()
      and om.organization_id = target_organization_id
      and om.status = 'active'
  );
$$;

create or replace function public.is_organization_admin(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.profile_id = auth.uid()
      and om.organization_id = target_organization_id
      and om.role in ('owner', 'admin')
      and om.status = 'active'
  );
$$;

create or replace function public.is_team_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_organization_member(target_organization_id);
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
    join public.organization_members om on om.organization_id = p.organization_id
    where p.id = target_project_id
      and om.profile_id = auth.uid()
      and om.status = 'active'
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
    join public.client_users cu
      on cu.client_id = p.client_id
     and cu.organization_id = p.organization_id
    where p.id = target_project_id
      and cu.profile_id = auth.uid()
      and p.activation_state = 'activated'
      and (
        p.status::text in ('active', 'paused')
        or (p.status::text = 'archived' and p.archive_reason::text = 'completed')
      )
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

create or replace function public.can_read_client(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clients c
    join public.organization_members om on om.organization_id = c.organization_id
    where c.id = target_client_id
      and om.profile_id = auth.uid()
      and om.status = 'active'
  )
  or exists (
    select 1
    from public.client_users cu
    where cu.client_id = target_client_id
      and cu.profile_id = auth.uid()
  );
$$;

create or replace function public.can_manage_client_user(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clients c
    join public.organization_members om on om.organization_id = c.organization_id
    where c.id = target_client_id
      and om.profile_id = auth.uid()
      and om.status = 'active'
  );
$$;

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

  insert into public.client_users (organization_id, client_id, profile_id, role)
  select c.organization_id, c.id, new.id, 'client_owner'
  from public.clients c
  where lower(c.primary_contact_email) = lower(coalesce(new.email, ''))
  on conflict (client_id, profile_id) do nothing;

  return new;
end;
$$;

drop policy if exists "authenticated users can create organizations" on public.organizations;
drop policy if exists "team can read own organizations" on public.organizations;
drop policy if exists "team can update own organizations" on public.organizations;
drop policy if exists "team can read profiles in organization" on public.profiles;
drop policy if exists "team can manage client users" on public.client_users;
drop policy if exists "client users can read own mapping" on public.client_users;
drop policy if exists "team can manage project templates" on public.project_templates;
drop policy if exists "team can manage projects" on public.projects;
drop policy if exists "project phases are readable by project members" on public.project_phases;
drop policy if exists "team can manage project phases" on public.project_phases;
drop policy if exists "deliverables are readable by project members" on public.deliverables;
drop policy if exists "team can manage deliverables" on public.deliverables;
drop policy if exists "comments are readable by project members" on public.deliverable_comments;
drop policy if exists "project members can add comments" on public.deliverable_comments;
drop policy if exists "approvals are readable by project members" on public.deliverable_approvals;
drop policy if exists "project members can add approvals" on public.deliverable_approvals;
drop policy if exists "team can manage documents" on public.documents;
drop policy if exists "clients can read visible documents" on public.documents;
drop policy if exists "responsibilities are readable by project members" on public.responsibility_items;
drop policy if exists "team can manage responsibilities" on public.responsibility_items;
drop policy if exists "team can manage notification events" on public.notification_events;
drop policy if exists "team can manage organization invitations" on public.access_invitations;

create policy "members can read own organizations" on public.organizations
  for select using (public.is_organization_member(id));
create policy "admins can update own organizations" on public.organizations
  for update using (public.is_organization_admin(id)) with check (public.is_organization_admin(id));

create policy "members can read organization memberships" on public.organization_members
  for select using (public.is_organization_member(organization_id));
create policy "admins can manage organization memberships" on public.organization_members
  for all using (public.is_organization_admin(organization_id))
  with check (public.is_organization_admin(organization_id));

create policy "members can read profiles in organization" on public.profiles
  for select using (
    exists (
      select 1
      from public.organization_members target_member
      where target_member.profile_id = profiles.id
        and public.is_organization_member(target_member.organization_id)
    )
  );

create policy "team can manage client users" on public.client_users
  for all using (
    public.is_organization_member(organization_id)
    and public.can_manage_client_user(client_id)
  )
  with check (
    public.is_organization_member(organization_id)
    and public.can_manage_client_user(client_id)
  );
create policy "client users can read own mapping" on public.client_users
  for select using (profile_id = auth.uid());

create policy "team can manage project templates" on public.project_templates
  for all using (organization_id is null or public.is_organization_member(organization_id))
  with check (organization_id is not null and public.is_organization_member(organization_id));

create policy "team can manage projects" on public.projects
  for all using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create policy "project phases are readable by project members" on public.project_phases
  for select using (public.can_access_project(project_id));
create policy "team can manage project phases" on public.project_phases
  for all using (public.is_organization_member(organization_id) and public.is_team_project(project_id))
  with check (public.is_organization_member(organization_id) and public.is_team_project(project_id));

create policy "deliverables are readable by project members" on public.deliverables
  for select using (public.can_access_project(project_id));
create policy "team can manage deliverables" on public.deliverables
  for all using (public.is_organization_member(organization_id) and public.is_team_project(project_id))
  with check (public.is_organization_member(organization_id) and public.is_team_project(project_id));

create policy "comments are readable by project members" on public.deliverable_comments
  for select using (
    exists (
      select 1 from public.deliverables d
      where d.id = deliverable_comments.deliverable_id
        and d.organization_id = deliverable_comments.organization_id
        and public.can_access_project(d.project_id)
    )
  );
create policy "project members can add comments" on public.deliverable_comments
  for insert with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.deliverables d
      where d.id = deliverable_comments.deliverable_id
        and d.organization_id = deliverable_comments.organization_id
        and public.can_access_project(d.project_id)
    )
  );

create policy "approvals are readable by project members" on public.deliverable_approvals
  for select using (
    exists (
      select 1 from public.deliverables d
      where d.id = deliverable_approvals.deliverable_id
        and d.organization_id = deliverable_approvals.organization_id
        and public.can_access_project(d.project_id)
    )
  );
create policy "project members can add approvals" on public.deliverable_approvals
  for insert with check (
    approved_by = auth.uid()
    and exists (
      select 1 from public.deliverables d
      where d.id = deliverable_approvals.deliverable_id
        and d.organization_id = deliverable_approvals.organization_id
        and public.can_access_project(d.project_id)
    )
  );

create policy "team can manage documents" on public.documents
  for all using (public.is_organization_member(organization_id) and public.is_team_project(project_id))
  with check (public.is_organization_member(organization_id) and public.is_team_project(project_id));
create policy "clients can read visible documents" on public.documents
  for select using (visible_to_client and public.is_client_project(project_id));

create policy "responsibilities are readable by project members" on public.responsibility_items
  for select using (public.can_access_project(project_id));
create policy "team can manage responsibilities" on public.responsibility_items
  for all using (public.is_organization_member(organization_id) and public.is_team_project(project_id))
  with check (public.is_organization_member(organization_id) and public.is_team_project(project_id));

create policy "team can manage notification events" on public.notification_events
  for all using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create policy "team can manage organization invitations" on public.access_invitations
  for all using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

insert into public.access_invitations (
  organization_id,
  email,
  user_type,
  team_role,
  status
)
values (
  '00000000-0000-0000-0000-000000000001',
  'rangercardeal@gmail.com',
  'team',
  'owner',
  'pending'
)
on conflict do nothing;

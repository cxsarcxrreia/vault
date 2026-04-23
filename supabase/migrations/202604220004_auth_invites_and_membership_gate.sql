create type public.access_invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');

create table public.access_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  email text not null,
  email_normalized text generated always as (lower(trim(email))) stored,
  user_type public.user_type not null,
  team_role public.team_role,
  client_role public.client_role,
  status public.access_invitation_status not null default 'pending',
  invited_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_invite_shape check (
    (user_type = 'team' and organization_id is not null and client_id is null and team_role is not null and client_role is null)
    or
    (user_type = 'client' and organization_id is not null and client_id is not null and team_role is null and client_role is not null)
  )
);

create index access_invitations_email_status_idx
  on public.access_invitations (email_normalized, status);

create unique index access_invitations_pending_unique_idx
  on public.access_invitations (email_normalized, coalesce(organization_id, '00000000-0000-0000-0000-000000000000'::uuid), coalesce(client_id, '00000000-0000-0000-0000-000000000000'::uuid), user_type)
  where status = 'pending';

create trigger access_invitations_set_updated_at before update on public.access_invitations
  for each row execute function public.set_updated_at();

alter table public.access_invitations enable row level security;

create policy "team can manage organization invitations" on public.access_invitations
  for all using (public.is_team_member(organization_id))
  with check (public.is_team_member(organization_id));

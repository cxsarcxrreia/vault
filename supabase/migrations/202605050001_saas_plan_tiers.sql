alter table public.organizations
  drop constraint if exists organizations_plan_tier_check;

alter table public.organizations
  drop constraint if exists organizations_subscription_status_check;

alter table public.organizations
  alter column plan_tier set default 'free',
  alter column subscription_status set default 'free';

update public.organizations
set
  plan_tier = case
    when lower(plan_tier) in ('free', 'medium', 'premium') then lower(plan_tier)
    else 'free'
  end,
  subscription_status = case
    when lower(subscription_status) = 'trial' then 'trialing'
    when lower(subscription_status) in ('free', 'active', 'trialing', 'manual', 'past_due', 'canceled') then lower(subscription_status)
    else 'free'
  end;

update public.organizations
set subscription_status = 'free'
where plan_tier = 'free'
  and subscription_status in ('manual', 'trialing');

insert into public.organizations (id, name, slug, plan_tier, subscription_status)
values ('00000000-0000-0000-0000-000000000001', 'Paladar', 'paladar', 'premium', 'manual')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  plan_tier = excluded.plan_tier,
  subscription_status = excluded.subscription_status;

update public.profiles
set
  user_type = 'team',
  organization_id = '00000000-0000-0000-0000-000000000001',
  team_role = 'owner'
where email = 'rangercardeal@gmail.com';

insert into public.organization_members (organization_id, profile_id, role, status)
select
  '00000000-0000-0000-0000-000000000001',
  profiles.id,
  'owner',
  'active'
from public.profiles
where profiles.email = 'rangercardeal@gmail.com'
on conflict (organization_id, profile_id) do update set
  role = 'owner',
  status = 'active';

insert into public.access_invitations (
  organization_id,
  email,
  user_type,
  team_role,
  status
)
select
  '00000000-0000-0000-0000-000000000001',
  'rangercardeal@gmail.com',
  'team',
  'owner',
  'pending'
where not exists (
  select 1
  from public.profiles p
  join public.organization_members om on om.profile_id = p.id
  where p.email = 'rangercardeal@gmail.com'
    and om.organization_id = '00000000-0000-0000-0000-000000000001'
    and om.status = 'active'
    and om.role in ('owner', 'admin')
)
and not exists (
  select 1
  from public.access_invitations ai
  where ai.email_normalized = 'rangercardeal@gmail.com'
    and ai.organization_id = '00000000-0000-0000-0000-000000000001'
    and ai.user_type = 'team'
    and ai.status = 'pending'
);

alter table public.organizations
  add constraint organizations_plan_tier_check
  check (plan_tier in ('free', 'medium', 'premium'));

alter table public.organizations
  add constraint organizations_subscription_status_check
  check (subscription_status in ('free', 'active', 'trialing', 'manual', 'past_due', 'canceled'));

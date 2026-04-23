alter type public.project_status add value if not exists 'paused' before 'archived';

do $$
begin
  if not exists (select 1 from pg_type where typname = 'archive_reason') then
    create type public.archive_reason as enum ('completed', 'cancelled', 'duplicate', 'expired');
  end if;
end
$$;

alter table public.projects
  add column if not exists archive_reason public.archive_reason;

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
      and (
        p.status::text in ('active', 'paused')
        or (p.status::text = 'archived' and p.archive_reason::text = 'completed')
      )
  );
$$;

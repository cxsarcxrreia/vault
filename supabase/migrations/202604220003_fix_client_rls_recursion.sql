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
    join public.profiles p on p.organization_id = c.organization_id
    where c.id = target_client_id
      and p.id = auth.uid()
      and p.user_type = 'team'
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
    join public.profiles p on p.organization_id = c.organization_id
    where c.id = target_client_id
      and p.id = auth.uid()
      and p.user_type = 'team'
  );
$$;

drop policy if exists "client users can read their client record" on public.clients;
drop policy if exists "team can manage client users" on public.client_users;

create policy "client members can read client records" on public.clients
  for select using (public.can_read_client(id));

create policy "team can manage client users" on public.client_users
  for all using (public.can_manage_client_user(client_id))
  with check (public.can_manage_client_user(client_id));

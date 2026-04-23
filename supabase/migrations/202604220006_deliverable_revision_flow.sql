create or replace function public.request_deliverable_revision(
  target_deliverable_id uuid,
  comment_body text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target record;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if length(trim(coalesce(comment_body, ''))) < 2 then
    raise exception 'Revision comment is required.';
  end if;

  select
    d.id,
    d.project_id,
    d.revisions_remaining,
    d.status as deliverable_status,
    p.client_id,
    p.organization_id,
    p.status as project_status,
    p.activation_state
  into target
  from public.deliverables d
  join public.projects p on p.id = d.project_id
  where d.id = target_deliverable_id
  for update of d;

  if target.id is null then
    raise exception 'Deliverable not found.';
  end if;

  if target.project_status <> 'active' or target.activation_state <> 'activated' then
    raise exception 'This project is not active.';
  end if;

  if not exists (
    select 1
    from public.client_users cu
    join public.profiles pr on pr.id = cu.profile_id
    where cu.client_id = target.client_id
      and cu.profile_id = current_user_id
      and pr.user_type = 'client'
  ) then
    raise exception 'Client membership required.';
  end if;

  if target.deliverable_status <> 'ready_for_review' then
    raise exception 'This deliverable is not ready for review.';
  end if;

  if target.revisions_remaining <= 0 then
    raise exception 'No revisions remain for this deliverable.';
  end if;

  update public.deliverables
  set
    status = 'revision_requested',
    revisions_remaining = target.revisions_remaining - 1
  where id = target_deliverable_id;

  insert into public.deliverable_comments (
    deliverable_id,
    profile_id,
    author_name,
    visibility,
    comment_type,
    body
  )
  values (
    target_deliverable_id,
    current_user_id,
    coalesce((select email from public.profiles where id = current_user_id), 'Client'),
    'client',
    'revision_request',
    trim(comment_body)
  );

  insert into public.notification_events (
    organization_id,
    project_id,
    client_id,
    deliverable_id,
    event_type,
    payload
  )
  values (
    target.organization_id,
    target.project_id,
    target.client_id,
    target_deliverable_id,
    'revision_requested_by_client',
    jsonb_build_object('revisions_remaining', target.revisions_remaining - 1)
  );

  return target.project_id;
end;
$$;

create or replace function public.approve_deliverable_as_client(target_deliverable_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target record;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  select
    d.id,
    d.project_id,
    d.status as deliverable_status,
    p.client_id,
    p.organization_id,
    p.status as project_status,
    p.activation_state
  into target
  from public.deliverables d
  join public.projects p on p.id = d.project_id
  where d.id = target_deliverable_id
  for update of d;

  if target.id is null then
    raise exception 'Deliverable not found.';
  end if;

  if target.project_status <> 'active' or target.activation_state <> 'activated' then
    raise exception 'This project is not active.';
  end if;

  if not exists (
    select 1
    from public.client_users cu
    join public.profiles pr on pr.id = cu.profile_id
    where cu.client_id = target.client_id
      and cu.profile_id = current_user_id
      and pr.user_type = 'client'
  ) then
    raise exception 'Client membership required.';
  end if;

  if target.deliverable_status = 'approved' then
    return target.project_id;
  end if;

  if target.deliverable_status <> 'ready_for_review' then
    raise exception 'Only deliverables ready for review can be approved.';
  end if;

  update public.deliverables
  set
    status = 'approved',
    approved_at = now(),
    approved_by = current_user_id,
    approval_source = 'client_portal'
  where id = target_deliverable_id;

  insert into public.deliverable_approvals (
    deliverable_id,
    approved_by,
    approval_source,
    notes
  )
  values (
    target_deliverable_id,
    current_user_id,
    'client_portal',
    'Approved by client in portal.'
  );

  insert into public.notification_events (
    organization_id,
    project_id,
    client_id,
    deliverable_id,
    event_type,
    payload
  )
  values (
    target.organization_id,
    target.project_id,
    target.client_id,
    target_deliverable_id,
    'deliverable_approved',
    '{}'::jsonb
  );

  return target.project_id;
end;
$$;

alter type public.deliverable_status add value if not exists 'editing' after 'in_progress';

alter table public.deliverables
  add column if not exists expected_delivery_date_changed_for_revision boolean not null default false;

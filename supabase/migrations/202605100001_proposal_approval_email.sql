alter table public.projects
  add column if not exists proposal_approved_by_email text;


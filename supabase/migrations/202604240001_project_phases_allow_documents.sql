alter table public.project_phases
  add column if not exists allows_documents boolean not null default false;

update public.project_phases
set allows_documents = phase_key in (
  'onboarding',
  'proposal_scope',
  'creative_direction',
  'production',
  'deliverables',
  'general'
)
where allows_documents = false;

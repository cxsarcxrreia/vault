alter table public.documents
  add column if not exists phase_key text not null default 'general';

alter table public.documents
  drop constraint if exists documents_phase_key_check;

alter table public.documents
  add constraint documents_phase_key_check
  check (phase_key in ('onboarding', 'proposal_scope', 'creative_direction', 'production', 'deliverables', 'general'));

update public.documents
set phase_key = case
  when lower(title || ' ' || document_type) like '%onboarding%' then 'onboarding'
  when lower(title || ' ' || document_type) like '%proposal%' then 'proposal_scope'
  when lower(title || ' ' || document_type) like '%contract%' then 'proposal_scope'
  when lower(title || ' ' || document_type) like '%scope%' then 'proposal_scope'
  when lower(title || ' ' || document_type) like '%pitch%' then 'creative_direction'
  when lower(title || ' ' || document_type) like '%moodboard%' then 'creative_direction'
  when lower(title || ' ' || document_type) like '%concept%' then 'creative_direction'
  when lower(title || ' ' || document_type) like '%production%' then 'production'
  else phase_key
end;

create index if not exists documents_project_phase_idx
  on public.documents (project_id, phase_key, created_at);

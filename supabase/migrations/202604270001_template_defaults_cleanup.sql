update public.project_phases
set allows_documents = phase_key in (
  'onboarding',
  'proposal_scope',
  'creative_direction',
  'production',
  'deliverables'
)
where phase_key in (
  'onboarding',
  'proposal_scope',
  'creative_direction',
  'production',
  'deliverables',
  'project_complete'
);

delete from public.project_templates template
where template.organization_id is not null
  and template.slug in (
    'one-time-content-production',
    'monthly-content-retainer',
    'branding-graphic-design'
  )
  and not exists (
    select 1
    from public.projects project
    where project.template_id = template.id
  );

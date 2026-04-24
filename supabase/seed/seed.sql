insert into public.organizations (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'Demo Agency', 'demo-agency')
on conflict (id) do update set name = excluded.name, slug = excluded.slug;

insert into public.project_templates (
  id,
  organization_id,
  name,
  slug,
  description,
  supports_calendar,
  default_phases,
  deliverable_type_suggestions,
  responsibility_presets
)
values
(
  '00000000-0000-0000-0000-000000000101',
  null,
  'One time Content Production',
  'one-time-content-production',
  'One shoot or campaign content package with review and delivery links.',
  false,
  '["Onboarding", "Proposal and Scope", "Creative Direction", "Production", "Deliverables", "Project Complete"]'::jsonb,
  array['Reels', 'Photos', 'Promo video', 'Aftermovie', 'Supporting assets'],
  '[{"title":"Content planning","owner":"shared"},{"title":"Shooting","owner":"agency"},{"title":"Publishing","owner":"client"}]'::jsonb
),
(
  '00000000-0000-0000-0000-000000000102',
  null,
  'Monthly Content Retainer',
  'monthly-content-retainer',
  'Recurring content production with optional calendar visibility.',
  true,
  '["Onboarding", "Proposal and Scope", "Creative Direction", "Production", "Deliverables", "Project Complete"]'::jsonb,
  array['Monthly reels', 'Monthly photos', 'Captions', 'Story sets', 'Graphic assets'],
  '[{"title":"Content planning","owner":"shared"},{"title":"Scheduling","owner":"client"},{"title":"Reporting","owner":"agency"}]'::jsonb
),
(
  '00000000-0000-0000-0000-000000000103',
  null,
  'Branding / Graphic Design',
  'branding-graphic-design',
  'Brand identity and design asset projects using the universal shell.',
  false,
  '["Onboarding", "Proposal and Scope", "Creative Direction", "Production", "Deliverables", "Project Complete"]'::jsonb,
  array['Logo pack', 'Brand book', 'Templates', 'Color palette', 'Typography set'],
  '[{"title":"Creative direction","owner":"shared"},{"title":"Design production","owner":"agency"},{"title":"Feedback rounds","owner":"client"}]'::jsonb
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  supports_calendar = excluded.supports_calendar,
  default_phases = excluded.default_phases,
  deliverable_type_suggestions = excluded.deliverable_type_suggestions,
  responsibility_presets = excluded.responsibility_presets;

insert into public.clients (id, organization_id, name, primary_contact_email, status)
values (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000001',
  'Northline Studio',
  'client@example.com',
  'active'
)
on conflict (id) do update set name = excluded.name, primary_contact_email = excluded.primary_contact_email, status = excluded.status;

insert into public.projects (
  id,
  organization_id,
  client_id,
  template_id,
  name,
  summary,
  service_type,
  status,
  pre_activation_status,
  activation_state,
  payment_confirmed_at,
  activated_at,
  current_phase_key,
  starts_on,
  ends_on
)
values (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  'Spring Launch Content',
  'Demo activated project for the MVP shell.',
  'Content Production',
  'active',
  'payment_confirmed',
  'activated',
  now(),
  now(),
  'production',
  '2026-04-20',
  '2026-05-15'
)
on conflict (id) do update set
  name = excluded.name,
  status = excluded.status,
  activation_state = excluded.activation_state,
  current_phase_key = excluded.current_phase_key;

insert into public.project_phases (project_id, name, phase_key, position, status)
values
('00000000-0000-0000-0000-000000000301', 'Onboarding', 'onboarding', 1, 'complete'),
('00000000-0000-0000-0000-000000000301', 'Proposal and Scope', 'proposal_scope', 2, 'complete'),
('00000000-0000-0000-0000-000000000301', 'Creative Direction', 'creative_direction', 3, 'complete'),
('00000000-0000-0000-0000-000000000301', 'Production', 'production', 4, 'active'),
('00000000-0000-0000-0000-000000000301', 'Deliverables', 'deliverables', 5, 'not_started'),
('00000000-0000-0000-0000-000000000301', 'Project Complete', 'project_complete', 6, 'not_started')
on conflict (project_id, phase_key) do update set status = excluded.status, position = excluded.position;

insert into public.deliverables (
  id,
  project_id,
  title,
  deliverable_type,
  expected_delivery_date,
  status,
  revision_limit,
  revisions_remaining,
  external_url
)
values
(
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000301',
  'Launch Reel Batch',
  'Reels',
  '2026-05-01',
  'ready_for_review',
  2,
  2,
  'https://drive.google.com'
),
(
  '00000000-0000-0000-0000-000000000402',
  '00000000-0000-0000-0000-000000000301',
  'Edited Photo Selects',
  'Photos',
  '2026-05-05',
  'in_progress',
  1,
  1,
  null
)
on conflict (id) do update set status = excluded.status, revisions_remaining = excluded.revisions_remaining;

insert into public.documents (id, project_id, title, document_type, phase_key, external_url, visible_to_client)
values
('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000301', 'Approved Proposal', 'Proposal PDF', 'proposal_scope', 'https://drive.google.com', true),
('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000301', 'Scope Summary', 'Scope summary', 'proposal_scope', 'https://drive.google.com', true),
('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000301', 'Onboarding Summary', 'Onboarding notes', 'onboarding', 'https://drive.google.com', true),
('00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000301', 'Moodboard Direction', 'Moodboard', 'creative_direction', 'https://drive.google.com', true),
('00000000-0000-0000-0000-000000000505', '00000000-0000-0000-0000-000000000301', 'Production Schedule', 'Production plan', 'production', 'https://drive.google.com', false)
on conflict (id) do update set
  title = excluded.title,
  document_type = excluded.document_type,
  phase_key = excluded.phase_key,
  external_url = excluded.external_url,
  visible_to_client = excluded.visible_to_client;

insert into public.responsibility_items (id, project_id, title, owner, position)
values
('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000301', 'Content planning', 'shared', 1),
('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000301', 'Shooting', 'agency', 2),
('00000000-0000-0000-0000-000000000603', '00000000-0000-0000-0000-000000000301', 'Publishing', 'client', 3)
on conflict (id) do update set owner = excluded.owner, position = excluded.position;

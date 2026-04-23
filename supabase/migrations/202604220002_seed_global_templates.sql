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
  slug = excluded.slug,
  description = excluded.description,
  supports_calendar = excluded.supports_calendar,
  default_phases = excluded.default_phases,
  deliverable_type_suggestions = excluded.deliverable_type_suggestions,
  responsibility_presets = excluded.responsibility_presets,
  updated_at = now();

import "server-only";

import { redirect } from "next/navigation";
import { ensureTeamMembership, upsertProfile } from "@/features/auth/access";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "agency";
}

async function getUniqueOrganizationSlug(service: any, agencyName: string) {
  const baseSlug = slugify(agencyName);
  const { data, error } = await service
    .from("organizations")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  if (error) {
    throw error;
  }

  const existingSlugs = new Set((data ?? []).map((item: { slug: string }) => item.slug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  let candidate = `${baseSlug}-${suffix}`;

  while (existingSlugs.has(candidate)) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }

  return candidate;
}

async function copyGlobalTemplates(service: any, organizationId: string) {
  const { data: templates, error } = await service
    .from("project_templates")
    .select("name,slug,description,supports_calendar,default_phases,deliverable_type_suggestions,responsibility_presets")
    .is("organization_id", null);

  if (error) {
    throw error;
  }

  if (!templates?.length) {
    return;
  }

  const { error: insertError } = await service.from("project_templates").insert(
    templates.map((template: any) => ({
      organization_id: organizationId,
      name: template.name,
      slug: template.slug,
      description: template.description,
      supports_calendar: template.supports_calendar,
      default_phases: template.default_phases,
      deliverable_type_suggestions: template.deliverable_type_suggestions,
      responsibility_presets: template.responsibility_presets
    }))
  );

  if (insertError) {
    throw insertError;
  }
}

export async function completeAgencyRegistrationForUser(input: {
  userId: string;
  email: string;
  fullName?: string | null;
}) {
  redirect(await completeAgencyRegistration(input));
}

export async function completeAgencyRegistration(input: {
  userId: string;
  email: string;
  fullName?: string | null;
}) {
  const service = createSupabaseServiceRoleClient() as any;
  const email = normalizeEmail(input.email);

  const { data: profile } = await service
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (profile) {
    const { count } = await service
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id)
      .eq("status", "active");

    if ((count ?? 0) > 0) {
      return "/admin";
    }
  }

  const { data: registration, error: registrationError } = await service
    .from("agency_registrations")
    .select("*")
    .eq("owner_email_normalized", email)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (registrationError) {
    return `/register?error=${encodeURIComponent(registrationError.message)}`;
  }

  if (!registration) {
    return "/register?error=registration-not-found";
  }

  const slug = await getUniqueOrganizationSlug(service, registration.agency_name);
  const { data: organization, error: organizationError } = await service
    .from("organizations")
    .insert({
      name: registration.agency_name,
      slug,
      plan_tier: "free",
      subscription_status: "manual"
    })
    .select("id")
    .single();

  if (organizationError || !organization) {
    return `/register?error=${encodeURIComponent(organizationError?.message ?? "Unable to create agency.")}`;
  }

  await upsertProfile({
    profileId: input.userId,
    email,
    fullName: registration.owner_name || input.fullName || null,
    userType: "team",
    organizationId: organization.id,
    teamRole: "owner"
  });

  await ensureTeamMembership({
    profileId: input.userId,
    organizationId: organization.id,
    role: "owner"
  });

  try {
    await copyGlobalTemplates(service, organization.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to copy default templates.";
    return `/register?error=${encodeURIComponent(message)}`;
  }

  await service
    .from("agency_registrations")
    .update({
      status: "accepted",
      organization_id: organization.id,
      accepted_by: input.userId,
      accepted_at: new Date().toISOString()
    })
    .eq("id", registration.id);

  return "/admin?registered=1";
}

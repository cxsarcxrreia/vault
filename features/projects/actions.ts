"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ensureClientMembership } from "@/features/auth/access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { phaseKeyFromName, phaseNamesFromTemplateDefault } from "./template-phases";

const uuidSchema = z.string().uuid();

const draftProjectSchema = z.object({
  projectName: z.string().min(2).max(120),
  clientName: z.string().min(2).max(120),
  clientEmail: z.string().email(),
  templateId: z.string().uuid().optional().or(z.literal("")),
  summary: z.string().max(1000).optional(),
  serviceType: z.string().max(120).optional(),
  startsOn: z.string().optional(),
  endsOn: z.string().optional()
});

const deliverableSchema = z.object({
  projectId: uuidSchema,
  title: z.string().min(2).max(160),
  deliverableType: z.string().min(2).max(80),
  expectedDeliveryDate: z.string().optional(),
  revisionLimit: z.coerce.number().int().min(0).max(20).default(2),
  externalUrl: z.string().url().optional().or(z.literal("")),
  internalNotes: z.string().max(1000).optional()
});

const deliverableLinkSchema = z.object({
  deliverableId: uuidSchema,
  projectId: uuidSchema,
  externalUrl: z.string().url().optional().or(z.literal(""))
});

const manualRevisionSchema = z.object({
  deliverableId: uuidSchema,
  projectId: uuidSchema,
  source: z.enum(["whatsapp", "email", "call", "admin_override"]),
  body: z.string().max(2000).optional()
});

const archiveProjectSchema = z.object({
  projectId: uuidSchema,
  archiveReason: z.enum(["completed", "cancelled", "duplicate", "expired"])
});

const phaseActionSchema = z.object({
  projectId: uuidSchema,
  phaseId: uuidSchema
});

async function getSupabaseOrRedirect() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?status=env-missing");
  }

  return supabase as any;
}

async function getTeamContext() {
  const supabase = await getSupabaseOrRedirect();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    redirect(`/admin?error=${encodeURIComponent("Unable to load your profile. Has the schema been applied?")}`);
  }

  if (!profile || profile.user_type !== "team" || !profile.organization_id) {
    redirect(`/admin?error=${encodeURIComponent("Your user needs a team profile with an organization before managing projects.")}`);
  }

  return { supabase, user, profile };
}

async function getProjectOrganization(projectId: string) {
  const { supabase, profile } = await getTeamContext();
  const { data: project, error } = await supabase
    .from("projects")
    .select("id,organization_id,client_id,status,pre_activation_status,activation_state,archive_reason")
    .eq("id", projectId)
    .maybeSingle();

  if (error || !project || project.organization_id !== profile.organization_id) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Project not found or unavailable.")}`);
  }

  return { supabase, profile, project };
}

function isProjectArchived(project: { status: string }) {
  return project.status === "archived";
}

function isProjectPaused(project: { status: string }) {
  return project.status === "paused";
}

function isProjectOperating(project: { status: string }) {
  return project.status === "active";
}

async function syncPrimaryClientMembership(supabase: any, clientId: string) {
  const { data: client, error } = await supabase
    .from("clients")
    .select("id,organization_id,primary_contact_email")
    .eq("id", clientId)
    .single();

  if (error) {
    throw error;
  }

  if (client?.primary_contact_email) {
    await ensureClientMembership({
      email: client.primary_contact_email,
      clientId: client.id,
      organizationId: client.organization_id,
      role: "client_owner"
    });
  }
}

async function getDefaultPhaseNamesForTemplate(supabase: any, templateId?: string) {
  if (!templateId) {
    return phaseNamesFromTemplateDefault(null);
  }

  const { data, error } = await supabase
    .from("project_templates")
    .select("default_phases")
    .eq("id", templateId)
    .maybeSingle();

  if (error || !data) {
    return phaseNamesFromTemplateDefault(null);
  }

  return phaseNamesFromTemplateDefault(data.default_phases);
}

function toProjectPhaseRows(phaseNames: string[]) {
  const usedKeys = new Map<string, number>();

  return phaseNames.map((name, index) => {
    const baseKey = phaseKeyFromName(name, index);
    const seenCount = usedKeys.get(baseKey) ?? 0;
    usedKeys.set(baseKey, seenCount + 1);

    return {
      name,
      phase_key: seenCount ? `${baseKey}_${seenCount + 1}` : baseKey,
      position: index + 1,
      status: index === 0 ? "active" : "not_started"
    };
  });
}

export async function createDraftProject(formData: FormData) {
  const parsed = draftProjectSchema.safeParse({
    projectName: formData.get("projectName"),
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail"),
    templateId: formData.get("templateId"),
    summary: formData.get("summary"),
    serviceType: formData.get("serviceType"),
    startsOn: formData.get("startsOn"),
    endsOn: formData.get("endsOn")
  });

  if (!parsed.success) {
    redirect(`/admin/projects?error=${encodeURIComponent("Please check the draft project form.")}`);
  }

  const { supabase, user, profile } = await getTeamContext();
  const phaseRows = toProjectPhaseRows(await getDefaultPhaseNamesForTemplate(supabase, parsed.data.templateId || undefined));
  const firstPhaseKey = phaseRows[0]?.phase_key ?? "onboarding";

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      organization_id: profile.organization_id!,
      name: parsed.data.clientName,
      primary_contact_email: parsed.data.clientEmail,
      status: "lead"
    })
    .select("id")
    .single();

  if (clientError) {
    redirect(`/admin/projects?error=${encodeURIComponent(clientError.message)}`);
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      organization_id: profile.organization_id!,
      client_id: client.id,
      template_id: parsed.data.templateId || null,
      name: parsed.data.projectName,
      summary: parsed.data.summary || null,
      service_type: parsed.data.serviceType || null,
      starts_on: parsed.data.startsOn || null,
      ends_on: parsed.data.endsOn || null,
      status: "draft",
      pre_activation_status: "draft",
      activation_state: "internal_draft",
      current_phase_key: firstPhaseKey,
      created_by: user.id
    })
    .select("id")
    .single();

  if (projectError) {
    redirect(`/admin/projects?error=${encodeURIComponent(projectError.message)}`);
  }

  const { error: phasesError } = await supabase.from("project_phases").insert(
    phaseRows.map((phase) => ({
      ...phase,
      project_id: project.id
    }))
  );

  if (phasesError) {
    redirect(`/admin/projects/${project.id}?error=${encodeURIComponent(phasesError.message)}`);
  }

  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${project.id}?created=1`);
}

export async function updateDealStatus(formData: FormData) {
  const projectId = uuidSchema.parse(formData.get("projectId"));
  const status = z.enum(["draft", "proposal_sent", "proposal_approved"]).parse(formData.get("status"));
  const { supabase, project } = await getProjectOrganization(projectId);

  if (
    project.activation_state === "payment_confirmed" ||
    project.activation_state === "activated" ||
    ["payment_confirmed", "active", "paused", "complete", "archived"].includes(project.status)
  ) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Payment is already confirmed. Proposal status can no longer be changed.")}`);
  }

  const activationState = status === "proposal_approved" ? "proposal_approved" : "internal_draft";
  const projectStatus = status === "proposal_sent" ? "proposal_sent" : "draft";

  const { error } = await supabase
    .from("projects")
    .update({
      pre_activation_status: status,
      activation_state: activationState,
      status: projectStatus,
      proposal_approved_at: status === "proposal_approved" ? new Date().toISOString() : null
    })
    .eq("id", projectId);

  if (error) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?updated=deal-status`);
}

export async function confirmPayment(formData: FormData) {
  const projectId = uuidSchema.parse(formData.get("projectId"));
  const { supabase, project } = await getProjectOrganization(projectId);

  if (isProjectPaused(project) || isProjectArchived(project)) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Resume or restore the project before changing payment state.")}`);
  }

  if (project.activation_state === "activated" || project.status === "active") {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("This project is already active.")}`);
  }

  if (project.activation_state === "payment_confirmed" || project.status === "payment_confirmed") {
    redirect(`/admin/projects/${projectId}?updated=payment-confirmed`);
  }

  if (project.pre_activation_status !== "proposal_approved" && project.activation_state !== "proposal_approved") {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Approve the proposal before confirming payment.")}`);
  }

  const { error } = await supabase
    .from("projects")
    .update({
      pre_activation_status: "payment_confirmed",
      status: "payment_confirmed",
      activation_state: "payment_confirmed",
      payment_confirmed_at: new Date().toISOString()
    })
    .eq("id", projectId);

  if (error) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?updated=payment-confirmed`);
}

export async function activateProject(formData: FormData) {
  const projectId = uuidSchema.parse(formData.get("projectId"));
  const { supabase, profile, project } = await getProjectOrganization(projectId);

  if (isProjectPaused(project) || isProjectArchived(project)) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Resume or restore the project before activating the portal.")}`);
  }

  if (project.activation_state === "activated" || project.status === "active") {
    redirect(`/admin/projects/${projectId}?updated=activated`);
  }

  if (project.activation_state !== "payment_confirmed" || project.status !== "payment_confirmed") {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Confirm payment before activating the portal.")}`);
  }

  const { data: firstPhase } = await supabase
    .from("project_phases")
    .select("phase_key")
    .eq("project_id", projectId)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase
    .from("projects")
    .update({
      status: "active",
      activation_state: "activated",
      archive_reason: null,
      activated_at: new Date().toISOString(),
      current_phase_key: firstPhase?.phase_key ?? "onboarding"
    })
    .eq("id", projectId);

  if (error) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("clients").update({ status: "active" }).eq("id", project.client_id);
  await syncPrimaryClientMembership(supabase, project.client_id);

  await supabase.from("notification_events").insert({
    organization_id: profile.organization_id!,
    project_id: projectId,
    client_id: project.client_id,
    event_type: "client_portal_activated",
    payload: { source: "team_activation" }
  });

  revalidatePath("/portal");
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?updated=activated`);
}

async function getOrderedProjectPhases(supabase: any, projectId: string) {
  const { data, error } = await supabase
    .from("project_phases")
    .select("id,phase_key,position,status")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  if (error || !data?.length) {
    throw new Error(error?.message ?? "No timeline phases exist for this project.");
  }

  return data as Array<{ id: string; phase_key: string; position: number; status: "not_started" | "active" | "complete" }>;
}

async function updatePhaseStatuses(
  supabase: any,
  projectId: string,
  phases: Array<{ id: string; phase_key: string; position: number }>,
  activeIndex: number
) {
  const updateResults = await Promise.all(
    phases.map((phase, index) =>
      supabase
        .from("project_phases")
        .update({
          status: index < activeIndex ? "complete" : index === activeIndex ? "active" : "not_started"
        })
        .eq("id", phase.id)
        .eq("project_id", projectId)
    )
  );

  const firstError = updateResults.find((result) => result.error)?.error;

  if (firstError) {
    throw firstError;
  }

  const { error } = await supabase
    .from("projects")
    .update({ current_phase_key: phases[activeIndex]?.phase_key ?? null })
    .eq("id", projectId);

  if (error) {
    throw error;
  }
}

export async function startProjectPhase(formData: FormData) {
  const parsed = phaseActionSchema.safeParse({
    projectId: formData.get("projectId"),
    phaseId: formData.get("phaseId")
  });

  if (!parsed.success) {
    redirect(`/admin/projects?error=${encodeURIComponent("Timeline action is missing project context.")}`);
  }

  const { supabase, project } = await getProjectOrganization(parsed.data.projectId);

  if (isProjectArchived(project)) {
    redirect(`/admin/projects/${parsed.data.projectId}?error=${encodeURIComponent("Restore the project before changing the timeline.")}`);
  }

  try {
    const phases = await getOrderedProjectPhases(supabase, parsed.data.projectId);
    const activeIndex = phases.findIndex((phase) => phase.id === parsed.data.phaseId);

    if (activeIndex === -1) {
      throw new Error("Timeline phase not found.");
    }

    await updatePhaseStatuses(supabase, parsed.data.projectId, phases, activeIndex);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the timeline.";
    redirect(`/admin/projects/${parsed.data.projectId}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/admin/projects/${parsed.data.projectId}`);
  revalidatePath(`/portal/project/${parsed.data.projectId}`);
  redirect(`/admin/projects/${parsed.data.projectId}?updated=timeline-started`);
}

export async function completeProjectPhase(formData: FormData) {
  const parsed = phaseActionSchema.safeParse({
    projectId: formData.get("projectId"),
    phaseId: formData.get("phaseId")
  });

  if (!parsed.success) {
    redirect(`/admin/projects?error=${encodeURIComponent("Timeline action is missing project context.")}`);
  }

  const { supabase, project } = await getProjectOrganization(parsed.data.projectId);

  if (isProjectArchived(project)) {
    redirect(`/admin/projects/${parsed.data.projectId}?error=${encodeURIComponent("Restore the project before changing the timeline.")}`);
  }

  try {
    const phases = await getOrderedProjectPhases(supabase, parsed.data.projectId);
    const phaseIndex = phases.findIndex((phase) => phase.id === parsed.data.phaseId);

    if (phaseIndex === -1) {
      throw new Error("Timeline phase not found.");
    }

    const nextIndex = Math.min(phaseIndex + 1, phases.length - 1);
    await updatePhaseStatuses(supabase, parsed.data.projectId, phases, nextIndex);

    if (nextIndex === phaseIndex) {
      const { error } = await supabase
        .from("project_phases")
        .update({ status: "complete" })
        .eq("id", parsed.data.phaseId)
        .eq("project_id", parsed.data.projectId);

      if (error) {
        throw error;
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the timeline.";
    redirect(`/admin/projects/${parsed.data.projectId}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/admin/projects/${parsed.data.projectId}`);
  revalidatePath(`/portal/project/${parsed.data.projectId}`);
  redirect(`/admin/projects/${parsed.data.projectId}?updated=timeline-completed`);
}

export async function pauseProject(formData: FormData) {
  const projectId = uuidSchema.parse(formData.get("projectId"));
  const { supabase, project } = await getProjectOrganization(projectId);

  if (!isProjectOperating(project)) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Only active projects can be paused.")}`);
  }

  const { error } = await supabase
    .from("projects")
    .update({ status: "paused", archive_reason: null })
    .eq("id", projectId);

  if (error) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/portal");
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?updated=paused`);
}

export async function resumeProject(formData: FormData) {
  const projectId = uuidSchema.parse(formData.get("projectId"));
  const { supabase, project } = await getProjectOrganization(projectId);

  if (!isProjectPaused(project)) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Only paused projects can be resumed.")}`);
  }

  const { error } = await supabase
    .from("projects")
    .update({ status: "active", archive_reason: null })
    .eq("id", projectId);

  if (error) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/portal");
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?updated=resumed`);
}

export async function archiveProject(formData: FormData) {
  const parsed = archiveProjectSchema.safeParse({
    projectId: formData.get("projectId"),
    archiveReason: formData.get("archiveReason")
  });

  if (!parsed.success) {
    redirect(`/admin/projects/${formData.get("projectId")}?error=${encodeURIComponent("Choose an archive reason.")}`);
  }

  const { supabase } = await getProjectOrganization(parsed.data.projectId);
  const { error } = await supabase
    .from("projects")
    .update({
      status: "archived",
      archive_reason: parsed.data.archiveReason
    })
    .eq("id", parsed.data.projectId);

  if (error) {
    redirect(`/admin/projects/${parsed.data.projectId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/portal");
  revalidatePath(`/admin/projects/${parsed.data.projectId}`);
  redirect(`/admin/projects/${parsed.data.projectId}?updated=archived`);
}

export async function restoreProject(formData: FormData) {
  const projectId = uuidSchema.parse(formData.get("projectId"));
  const { supabase, project } = await getProjectOrganization(projectId);

  if (!isProjectArchived(project)) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Only archived projects can be restored.")}`);
  }

  const restoredStatus = project.activation_state === "activated" ? "active" : "draft";
  const { error } = await supabase
    .from("projects")
    .update({
      status: restoredStatus,
      archive_reason: null
    })
    .eq("id", projectId);

  if (error) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/portal");
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?updated=restored`);
}

export async function deleteDraftProject(formData: FormData) {
  const projectId = uuidSchema.parse(formData.get("projectId"));
  const { supabase, project } = await getProjectOrganization(projectId);

  if (project.activation_state !== "internal_draft" || !["draft", "proposal_sent"].includes(project.status)) {
    redirect(`/admin/projects?error=${encodeURIComponent("Only unactivated draft projects can be deleted. Archive active work instead.")}`);
  }

  const clientId = project.client_id;
  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) {
    redirect(`/admin/projects?error=${encodeURIComponent(error.message)}`);
  }

  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId);

  if ((count ?? 0) === 0) {
    await supabase.from("clients").delete().eq("id", clientId);
  }

  revalidatePath("/admin/projects");
  revalidatePath("/admin/clients");
  redirect("/admin/projects?deleted=1");
}

export async function syncClientPortalAccess(formData: FormData) {
  const projectId = uuidSchema.parse(formData.get("projectId"));
  const { supabase, project } = await getProjectOrganization(projectId);

  if (project.activation_state !== "activated" && project.status !== "active") {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Activate the project before syncing client portal access.")}`);
  }

  try {
    await syncPrimaryClientMembership(supabase, project.client_id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sync client portal access.";
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?updated=client-access-synced`);
}

export async function createDeliverable(formData: FormData) {
  const parsed = deliverableSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    deliverableType: formData.get("deliverableType"),
    expectedDeliveryDate: formData.get("expectedDeliveryDate"),
    revisionLimit: formData.get("revisionLimit"),
    externalUrl: formData.get("externalUrl"),
    internalNotes: formData.get("internalNotes")
  });

  if (!parsed.success) {
    redirect(`/admin/projects/${formData.get("projectId")}?error=${encodeURIComponent("Please check the deliverable form.")}`);
  }

  const { supabase, profile, project: projectContext } = await getProjectOrganization(parsed.data.projectId);

  if (isProjectArchived(projectContext)) {
    redirect(`/admin/projects/${parsed.data.projectId}?error=${encodeURIComponent("Archived projects are read-only. Restore the project before adding deliverables.")}`);
  }

  const { data: project } = await supabase
    .from("projects")
    .select("client_id")
    .eq("id", parsed.data.projectId)
    .single();

  const { error } = await supabase.from("deliverables").insert({
    project_id: parsed.data.projectId,
    title: parsed.data.title,
    deliverable_type: parsed.data.deliverableType,
    expected_delivery_date: parsed.data.expectedDeliveryDate || null,
    revision_limit: parsed.data.revisionLimit,
    revisions_remaining: parsed.data.revisionLimit,
    external_url: parsed.data.externalUrl || null,
    internal_notes: parsed.data.internalNotes || null,
    status: parsed.data.externalUrl ? "ready_for_review" : "planned"
  });

  if (error) {
    redirect(`/admin/projects/${parsed.data.projectId}?error=${encodeURIComponent(error.message)}`);
  }

  if (parsed.data.externalUrl && project) {
    await supabase.from("notification_events").insert({
      organization_id: profile.organization_id!,
      project_id: parsed.data.projectId,
      client_id: project.client_id,
      event_type: "deliverable_ready_for_review",
      payload: { title: parsed.data.title }
    });
  }

  revalidatePath(`/admin/projects/${parsed.data.projectId}`);
  redirect(`/admin/projects/${parsed.data.projectId}?updated=deliverable-created`);
}

export async function updateDeliverableLink(formData: FormData) {
  const parsed = deliverableLinkSchema.safeParse({
    deliverableId: formData.get("deliverableId"),
    projectId: formData.get("projectId"),
    externalUrl: formData.get("externalUrl")
  });

  if (!parsed.success) {
    redirect(`/admin/projects/${formData.get("projectId")}?error=${encodeURIComponent("Enter a valid deliverable link.")}`);
  }

  const { supabase, project } = await getProjectOrganization(parsed.data.projectId);

  if (isProjectArchived(project)) {
    redirect(`/admin/projects/${parsed.data.projectId}?error=${encodeURIComponent("Archived projects are read-only. Restore the project before editing links.")}`);
  }

  const { error } = await supabase
    .from("deliverables")
    .update({ external_url: parsed.data.externalUrl || null })
    .eq("id", parsed.data.deliverableId)
    .eq("project_id", parsed.data.projectId);

  if (error) {
    redirect(`/admin/projects/${parsed.data.projectId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/projects/${parsed.data.projectId}`);
  revalidatePath(`/portal/project/${parsed.data.projectId}`);
  redirect(`/admin/projects/${parsed.data.projectId}?updated=deliverable-link-updated`);
}

export async function logManualRevision(formData: FormData) {
  const parsed = manualRevisionSchema.safeParse({
    deliverableId: formData.get("deliverableId"),
    projectId: formData.get("projectId"),
    source: formData.get("source"),
    body: formData.get("body") || undefined
  });

  if (!parsed.success) {
    redirect(`/admin/projects/${formData.get("projectId")}?error=${encodeURIComponent("Check the manual revision form.")}`);
  }

  const { supabase, profile, project } = await getProjectOrganization(parsed.data.projectId);

  if (isProjectArchived(project)) {
    redirect(`/admin/projects/${parsed.data.projectId}?error=${encodeURIComponent("Archived projects are read-only. Restore the project before logging revisions.")}`);
  }

  const { data: deliverable, error: deliverableError } = await supabase
    .from("deliverables")
    .select("status,revisions_remaining")
    .eq("id", parsed.data.deliverableId)
    .eq("project_id", parsed.data.projectId)
    .single();

  if (deliverableError || !deliverable) {
    redirect(`/admin/projects/${parsed.data.projectId}?error=${encodeURIComponent("Deliverable not found.")}`);
  }

  if (deliverable.status !== "ready_for_review") {
    redirect(`/admin/projects/${parsed.data.projectId}?error=${encodeURIComponent("Manual revisions can only be logged while a deliverable is ready for review.")}`);
  }

  if (deliverable.revisions_remaining <= 0) {
    redirect(`/admin/projects/${parsed.data.projectId}?error=${encodeURIComponent("No revisions remain for this deliverable.")}`);
  }

  const { error } = await supabase
    .from("deliverables")
    .update({
      status: "revision_requested",
      revisions_remaining: deliverable.revisions_remaining - 1
    })
    .eq("id", parsed.data.deliverableId);

  if (error) {
    redirect(`/admin/projects/${parsed.data.projectId}?error=${encodeURIComponent(error.message)}`);
  }

  const sourceLabel = parsed.data.source.replaceAll("_", " ");
  await supabase.from("deliverable_comments").insert({
    deliverable_id: parsed.data.deliverableId,
    profile_id: profile.id,
    author_name: "Team",
    visibility: "client",
    comment_type: "revision_request",
    body: parsed.data.body ? `Manual revision via ${sourceLabel}: ${parsed.data.body}` : `Manual revision requested via ${sourceLabel}.`
  });

  await supabase.from("notification_events").insert({
    organization_id: profile.organization_id!,
    project_id: parsed.data.projectId,
    client_id: project.client_id,
    deliverable_id: parsed.data.deliverableId,
    event_type: "revision_requested_by_client",
    payload: { source: parsed.data.source, manual: true, revisions_remaining: deliverable.revisions_remaining - 1 }
  });

  revalidatePath(`/admin/projects/${parsed.data.projectId}`);
  revalidatePath(`/portal/project/${parsed.data.projectId}`);
  redirect(`/admin/projects/${parsed.data.projectId}?updated=manual-revision-logged`);
}

export async function approveDeliverable(formData: FormData) {
  const deliverableId = uuidSchema.parse(formData.get("deliverableId"));
  const projectId = uuidSchema.parse(formData.get("projectId"));
  const supabase = await getSupabaseOrRedirect();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/portal/project/${projectId}`);
  }

  const { error } = await supabase.rpc("approve_deliverable_as_client", {
    target_deliverable_id: deliverableId
  });

  if (error) {
    redirect(`/portal/project/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/portal/project/${projectId}`);
  redirect(`/portal/project/${projectId}?updated=deliverable-approved`);
}

export async function requestDeliverableRevision(formData: FormData) {
  const deliverableId = uuidSchema.parse(formData.get("deliverableId"));
  const projectId = uuidSchema.parse(formData.get("projectId"));
  const body = z.string().min(2).max(2000).parse(formData.get("body"));
  const supabase = await getSupabaseOrRedirect();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/portal/project/${projectId}`);
  }

  const { error } = await supabase.rpc("request_deliverable_revision", {
    target_deliverable_id: deliverableId,
    comment_body: body
  });

  if (error) {
    redirect(`/portal/project/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/portal/project/${projectId}`);
  redirect(`/portal/project/${projectId}?updated=revision-requested`);
}

export async function resubmitDeliverable(formData: FormData) {
  const deliverableId = uuidSchema.parse(formData.get("deliverableId"));
  const projectId = uuidSchema.parse(formData.get("projectId"));
  const { supabase, profile, project } = await getProjectOrganization(projectId);

  if (isProjectArchived(project)) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Archived projects are read-only. Restore the project before resubmitting deliverables.")}`);
  }

  const { data: deliverable, error: deliverableError } = await supabase
    .from("deliverables")
    .select("status")
    .eq("id", deliverableId)
    .eq("project_id", projectId)
    .single();

  if (deliverableError || !deliverable) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Deliverable not found.")}`);
  }

  if (deliverable.status !== "revision_requested") {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Only deliverables with a pending revision request can be resubmitted.")}`);
  }

  const { error } = await supabase
    .from("deliverables")
    .update({ status: "ready_for_review" })
    .eq("id", deliverableId);

  if (error) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("deliverable_comments").insert({
    deliverable_id: deliverableId,
    profile_id: profile.id,
    author_name: "Team",
    visibility: "client",
    comment_type: "comment",
    body: "Revision resubmitted for client review."
  });

  await supabase.from("notification_events").insert({
    organization_id: profile.organization_id!,
    project_id: projectId,
    client_id: project.client_id,
    deliverable_id: deliverableId,
    event_type: "deliverable_ready_for_review",
    payload: { source: "revision_resubmitted" }
  });

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/portal/project/${projectId}`);
  redirect(`/admin/projects/${projectId}?updated=deliverable-resubmitted`);
}

export async function approveDeliverableOnBehalf(formData: FormData) {
  const deliverableId = uuidSchema.parse(formData.get("deliverableId"));
  const projectId = uuidSchema.parse(formData.get("projectId"));
  const source = z.enum(["whatsapp", "email", "call", "admin_override"]).parse(formData.get("approvalSource"));
  const notes = z.string().max(1000).optional().parse(formData.get("notes") || undefined);
  const { supabase, profile, project } = await getProjectOrganization(projectId);

  if (isProjectArchived(project)) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Archived projects are read-only. Restore the project before marking approvals.")}`);
  }

  const { error } = await supabase
    .from("deliverables")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: profile.id,
      approval_source: source
    })
    .eq("id", deliverableId);

  if (error) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("deliverable_approvals").insert({
    deliverable_id: deliverableId,
    approved_by: profile.id,
    approval_source: source,
    notes: notes || "Approved on behalf of client."
  });

  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?updated=approved-on-behalf`);
}

export async function undoDeliverableApproval(formData: FormData) {
  const deliverableId = uuidSchema.parse(formData.get("deliverableId"));
  const projectId = uuidSchema.parse(formData.get("projectId"));
  const { supabase, profile, project } = await getProjectOrganization(projectId);

  if (isProjectArchived(project)) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Archived projects are read-only. Restore the project before undoing approvals.")}`);
  }

  const { data: deliverable, error: deliverableError } = await supabase
    .from("deliverables")
    .select("status")
    .eq("id", deliverableId)
    .eq("project_id", projectId)
    .single();

  if (deliverableError || !deliverable) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Deliverable not found.")}`);
  }

  if (deliverable.status !== "approved") {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent("Only approved deliverables can have approval undone.")}`);
  }

  const { error } = await supabase
    .from("deliverables")
    .update({
      status: "ready_for_review",
      approved_at: null,
      approved_by: null,
      approval_source: null
    })
    .eq("id", deliverableId);

  if (error) {
    redirect(`/admin/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("deliverable_comments").insert({
    deliverable_id: deliverableId,
    profile_id: profile.id,
    author_name: "Team",
    visibility: "team",
    comment_type: "comment",
    body: "Approval undone. Deliverable returned to ready for review."
  });

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/portal/project/${projectId}`);
  redirect(`/admin/projects/${projectId}?updated=approval-undone`);
}

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database.types";
import type { Client, Project, ProjectTemplate } from "@/types/domain";
import { emptyWithError, type DataState } from "./errors";
import { clients as demoClients, getProjectById, projectTemplates as demoTemplates, projects as demoProjects } from "./demo-data";
import { mapDeliverable, mapDocument, mapPhase, mapProject, mapResponsibility } from "./mappers";
import { phaseNamesFromTemplateDefault, templatePhaseDefinitionsFromDefault } from "./template-phases";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type AdminDashboardMetrics = {
  activeProjects: number;
  readyForClientReview: number;
  revisionRequests: number;
  readyToActivate: number;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const standardTemplateSlugs = new Set([
  "one-time-content-production",
  "monthly-content-retainer",
  "branding-graphic-design"
]);

function getDemoDashboardMetrics(): AdminDashboardMetrics {
  const operationalProjects = demoProjects.filter((project) => ["active", "paused"].includes(project.status));

  return {
    activeProjects: demoProjects.filter((project) => project.status === "active").length,
    readyForClientReview: operationalProjects.reduce(
      (total, project) => total + project.deliverables.filter((deliverable) => deliverable.status === "ready_for_review").length,
      0
    ),
    revisionRequests: operationalProjects.reduce(
      (total, project) => total + project.deliverables.filter((deliverable) => deliverable.status === "revision_requested").length,
      0
    ),
    readyToActivate: demoProjects.filter(
      (project) => project.activationState === "payment_confirmed" && project.status === "payment_confirmed"
    ).length
  };
}

async function getClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  return (await createSupabaseServerClient()) as any;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await getClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data ?? null;
}

export async function getCurrentOrganizationName(): Promise<string | null> {
  const supabase = await getClient();

  if (!supabase) {
    return "Paladar";
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("organization_members")
    .select("organizations(name)")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const organization = Array.isArray(data?.organizations) ? data.organizations[0] : data?.organizations;
  return organization?.name ?? null;
}

export async function getCurrentOrganizationIdentity(): Promise<{ id: string; name: string } | null> {
  const supabase = await getClient();

  if (!supabase) {
    return { id: "demo-paladar", name: "Paladar" };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("organization_members")
    .select("organization_id,organizations(name)")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const organization = Array.isArray(data?.organizations) ? data.organizations[0] : data?.organizations;

  return data?.organization_id && organization?.name
    ? {
        id: data.organization_id,
        name: organization.name
      }
    : null;
}

export async function getProjectTemplates(): Promise<DataState<ProjectTemplate[]>> {
  const supabase = await getClient();

  if (!supabase) {
    return { data: demoTemplates, error: "Supabase environment is not configured." };
  }

  const { data, error } = await supabase
    .from("project_templates")
    .select("id,name,slug,organization_id,supports_calendar,default_phases,deliverable_type_suggestions")
    .order("name");

  if (error) {
    return emptyWithError([], error);
  }

  const visibleTemplates = (data ?? []).filter((template: Database["public"]["Tables"]["project_templates"]["Row"]) => {
    if (!template.organization_id) {
      return standardTemplateSlugs.has(template.slug);
    }

    return !standardTemplateSlugs.has(template.slug);
  });

  return {
    data: visibleTemplates.map((template: Database["public"]["Tables"]["project_templates"]["Row"]) => ({
      id: template.id,
      name: template.name,
      slug: template.slug,
      supportsCalendar: template.supports_calendar,
      isCustom: Boolean(template.organization_id),
      phaseDefinitions: templatePhaseDefinitionsFromDefault(template.default_phases),
      defaultPhases: phaseNamesFromTemplateDefault(template.default_phases),
      deliverableTypeSuggestions: template.deliverable_type_suggestions
    })),
    error: null
  };
}

export async function getClients(): Promise<DataState<Client[]>> {
  const supabase = await getClient();

  if (!supabase) {
    return { data: demoClients, error: "Supabase environment is not configured." };
  }

  const { data, error } = await supabase
    .from("clients")
    .select("id,name,primary_contact_email,status,projects(id,created_at,status,activation_state,archive_reason)")
    .order("name");

  if (error) {
    return emptyWithError([], error);
  }

  return {
    data: data.map((client: any) => {
      const activeProject = [...(client.projects ?? [])]
        .filter(
          (project) =>
            project.activation_state === "activated" &&
            (["active", "paused"].includes(project.status) || (project.status === "archived" && project.archive_reason === "completed"))
        )
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];

      return {
        id: client.id,
        name: client.name,
        primaryContactEmail: client.primary_contact_email,
        status: client.status,
        activeProjectId: activeProject?.id ?? null
      };
    }),
    error: null
  };
}

export async function getAdminProjects(): Promise<DataState<Project[]>> {
  const supabase = await getClient();

  if (!supabase) {
    return { data: demoProjects, error: "Supabase environment is not configured." };
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*, clients(name, primary_contact_email), project_templates(name, supports_calendar), deliverables(*)")
    .order("created_at", { ascending: false });

  if (error) {
    return emptyWithError([], error);
  }

  return {
    data: data.map((project: any) =>
      mapProject(project, {
        deliverables: (project.deliverables ?? []).map((deliverable: Database["public"]["Tables"]["deliverables"]["Row"]) =>
          mapDeliverable(deliverable)
        )
      })
    ),
    error: null
  };
}

export async function getAdminDashboardMetrics(): Promise<DataState<AdminDashboardMetrics>> {
  const supabase = await getClient();
  const emptyMetrics: AdminDashboardMetrics = {
    activeProjects: 0,
    readyForClientReview: 0,
    revisionRequests: 0,
    readyToActivate: 0
  };

  if (!supabase) {
    return { data: getDemoDashboardMetrics(), error: "Supabase environment is not configured." };
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id,status,activation_state,deliverables(status)")
    .order("created_at", { ascending: false });

  if (error) {
    return emptyWithError(emptyMetrics, error);
  }

  const projects = data ?? [];
  const operationalProjects = projects.filter((project: any) => ["active", "paused"].includes(project.status));

  return {
    data: {
      activeProjects: projects.filter((project: any) => project.status === "active").length,
      readyForClientReview: operationalProjects.reduce(
        (total: number, project: any) =>
          total + (project.deliverables ?? []).filter((deliverable: any) => deliverable.status === "ready_for_review").length,
        0
      ),
      revisionRequests: operationalProjects.reduce(
        (total: number, project: any) =>
          total + (project.deliverables ?? []).filter((deliverable: any) => deliverable.status === "revision_requested").length,
        0
      ),
      readyToActivate: projects.filter(
        (project: any) => project.activation_state === "payment_confirmed" && project.status === "payment_confirmed"
      ).length
    },
    error: null
  };
}

export async function getPortalProjects(): Promise<DataState<Project[]>> {
  const supabase = await getClient();

  if (!supabase) {
    return { data: demoProjects.filter((project) => project.activationState === "activated"), error: "Supabase environment is not configured." };
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*, clients(name, primary_contact_email), project_templates(name, supports_calendar), deliverables(*)")
    .eq("activation_state", "activated")
    .order("created_at", { ascending: false });

  if (error) {
    return emptyWithError([], error);
  }

  return {
    data: data
      .filter(
        (project: any) =>
          ["active", "paused"].includes(project.status) || (project.status === "archived" && project.archive_reason === "completed")
      )
      .map((project: any) =>
        mapProject(project, {
          deliverables: (project.deliverables ?? []).map((deliverable: Database["public"]["Tables"]["deliverables"]["Row"]) =>
            mapDeliverable(deliverable)
          )
        })
      ),
    error: null
  };
}

export async function getProjectDetail(id: string): Promise<DataState<Project | null>> {
  if (!uuidPattern.test(id)) {
    return {
      data: null,
      error: "This project link is no longer valid. Open the project from the portal project list."
    };
  }

  const supabase = await getClient();

  if (!supabase) {
    return { data: getProjectById(id), error: "Supabase environment is not configured." };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*, clients(name, primary_contact_email), project_templates(name, supports_calendar)")
    .eq("id", id)
    .maybeSingle();

  if (projectError) {
    return emptyWithError(null, projectError);
  }

  if (!project) {
    return { data: null, error: "Project not found." };
  }

  const [phasesResult, deliverablesResult, documentsResult, responsibilitiesResult] = await Promise.all([
    supabase.from("project_phases").select("*").eq("project_id", id).order("position"),
    supabase.from("deliverables").select("*").eq("project_id", id).order("created_at"),
    supabase.from("documents").select("*").eq("project_id", id).order("phase_key").order("created_at"),
    supabase.from("responsibility_items").select("*").eq("project_id", id).order("position")
  ]);

  const firstError = phasesResult.error ?? deliverablesResult.error ?? documentsResult.error ?? responsibilitiesResult.error;

  if (firstError) {
    return emptyWithError(null, firstError);
  }

  const deliverables = deliverablesResult.data ?? [];
  const deliverableIds = deliverables.map((deliverable: Database["public"]["Tables"]["deliverables"]["Row"]) => deliverable.id);
  const commentsResult = deliverableIds.length
    ? await supabase
        .from("deliverable_comments")
        .select("*")
        .in("deliverable_id", deliverableIds)
        .order("created_at", { ascending: true })
    : { data: [], error: null };

  if (commentsResult.error) {
    return emptyWithError(null, commentsResult.error);
  }

  const commentsByDeliverable = new Map<string, Database["public"]["Tables"]["deliverable_comments"]["Row"][]>();
  for (const comment of commentsResult.data ?? []) {
    commentsByDeliverable.set(comment.deliverable_id, [...(commentsByDeliverable.get(comment.deliverable_id) ?? []), comment]);
  }

  return {
    data: mapProject(project, {
      phases: (phasesResult.data ?? []).map(mapPhase),
      deliverables: deliverables.map((deliverable: Database["public"]["Tables"]["deliverables"]["Row"]) =>
        mapDeliverable(deliverable, commentsByDeliverable.get(deliverable.id))
      ),
      documents: (documentsResult.data ?? []).map(mapDocument),
      responsibilities: (responsibilitiesResult.data ?? []).map(mapResponsibility)
    }),
    error: null
  };
}

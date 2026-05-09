import { DraftProjectForm } from "@/components/project/draft-project-form";
import { ProjectsList } from "@/components/project/projects-list";
import { AppWorkspace, WorkspaceHeader } from "@/components/layout/app-workspace";
import { FormMessage } from "@/components/shared/form-message";
import { SetupRequired } from "@/components/shared/setup-required";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentOrganizationPlanUsage } from "@/features/plans/queries";
import { getAdminProjects, getProjectTemplates } from "@/features/projects/queries";

type ProjectsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = typeof params.error === "string" ? params.error : null;
  const limit = typeof params.limit === "string" ? params.limit : null;
  const deleted = typeof params.deleted === "string" ? params.deleted : null;
  const templateCreated = typeof params.templateCreated === "string" ? params.templateCreated : null;
  const [projectsResult, templatesResult, planUsageResult] = await Promise.all([
    getAdminProjects(),
    getProjectTemplates(),
    getCurrentOrganizationPlanUsage()
  ]);

  return (
    <AppWorkspace width="wide">
      <WorkspaceHeader
        label="Team"
        title="Projects"
        meta="Draft setup, activation state, and active client work."
      />
      <div className="space-y-6">
        {error ? <FormMessage type="error">{error}</FormMessage> : null}
        {limit === "projects" ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">Review project capacity and upgrade options for this organization.</p>
            <ButtonLink href="/admin/billing" variant="outline">View plan</ButtonLink>
          </div>
        ) : null}
        {deleted ? <FormMessage type="success">Draft project deleted.</FormMessage> : null}
        {templateCreated ? <FormMessage type="success" autoDismissMs={5000}>Custom service template created. Finish the draft setup below.</FormMessage> : null}
        {projectsResult.setupRequired || templatesResult.setupRequired || planUsageResult.setupRequired ? (
          <SetupRequired message={projectsResult.error ?? templatesResult.error ?? planUsageResult.error} />
        ) : (
          <DraftProjectForm templates={templatesResult.data} planUsage={planUsageResult.data ?? undefined} />
        )}
        <ProjectsList projects={projectsResult.data} mode="admin" />
      </div>
    </AppWorkspace>
  );
}

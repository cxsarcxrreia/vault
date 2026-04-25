import { DraftProjectForm } from "@/components/project/draft-project-form";
import { ProjectsList } from "@/components/project/projects-list";
import { PageHeader } from "@/components/layout/page-header";
import { FormMessage } from "@/components/shared/form-message";
import { SetupRequired } from "@/components/shared/setup-required";
import { getAdminProjects, getProjectTemplates } from "@/features/projects/queries";

type ProjectsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = typeof params.error === "string" ? params.error : null;
  const deleted = typeof params.deleted === "string" ? params.deleted : null;
  const templateCreated = typeof params.templateCreated === "string" ? params.templateCreated : null;
  const [projectsResult, templatesResult] = await Promise.all([getAdminProjects(), getProjectTemplates()]);

  return (
    <>
      <PageHeader
        eyebrow="Team"
        title="Projects"
        description="Internal draft and active client projects live here. Activation remains team-controlled after payment confirmation."
      />
      <div className="space-y-6 p-6">
        {error ? <FormMessage type="error">{error}</FormMessage> : null}
        {deleted ? <FormMessage type="success">Draft project deleted.</FormMessage> : null}
        {templateCreated ? <FormMessage type="success" autoDismissMs={5000}>Custom service template created. Finish the draft setup below.</FormMessage> : null}
        {projectsResult.setupRequired || templatesResult.setupRequired ? (
          <SetupRequired message={projectsResult.error ?? templatesResult.error} />
        ) : (
          <DraftProjectForm templates={templatesResult.data} />
        )}
        <ProjectsList projects={projectsResult.data} mode="admin" />
      </div>
    </>
  );
}

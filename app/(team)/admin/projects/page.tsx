import Link from "next/link";
import { DraftProjectForm } from "@/components/project/draft-project-form";
import { PageHeader } from "@/components/layout/page-header";
import { FormMessage } from "@/components/shared/form-message";
import { SetupRequired } from "@/components/shared/setup-required";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteDraftProject } from "@/features/projects/actions";
import { getAdminProjects, getProjectTemplates } from "@/features/projects/queries";
import { formatArchiveReason, getMainProjectState, getProjectStateTone } from "@/features/projects/state";

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
        actions={<ButtonLink href="/admin/projects" variant="outline">Create draft</ButtonLink>}
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
        <div className="grid gap-4">
        {projectsResult.data.length ? projectsResult.data.map((project) => {
          const mainState = getMainProjectState(project);
          const archiveReason = formatArchiveReason(project.archiveReason);
          const canDelete = project.activationState === "internal_draft" && ["draft", "proposal_sent"].includes(project.status);

          return (
            <div key={project.id} className="relative">
              <Link href={`/admin/projects/${project.id}`} className="block">
                <Card className="transition-colors hover:bg-muted/40">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 pr-28">
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{project.clientName}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={getProjectStateTone(project.status)}>{mainState}</Badge>
                      {archiveReason ? <Badge>{archiveReason}</Badge> : null}
                    </div>
                  </CardContent>
                </Card>
              </Link>
              {canDelete ? (
                <form action={deleteDraftProject} className="absolute right-5 top-1/2 -translate-y-1/2">
                  <input type="hidden" name="projectId" value={project.id} />
                  <Button type="submit" variant="danger">Delete</Button>
                </form>
              ) : null}
            </div>
          );
        }) : (
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">No projects yet.</p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </>
  );
}

import { AppWorkspace, WorkspaceHeader } from "@/components/layout/app-workspace";
import { ProjectsList } from "@/components/project/projects-list";
import { SetupRequired } from "@/components/shared/setup-required";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentProfile, getPortalProjects } from "@/features/projects/queries";

export default async function PortalPage() {
  const [profile, result] = await Promise.all([getCurrentProfile(), getPortalProjects()]);
  const activeProjects = result.data;
  const isTeamPreview = profile?.user_type === "team";

  return (
    <AppWorkspace>
      <WorkspaceHeader
        label={isTeamPreview ? "Team preview" : "Client"}
        title={isTeamPreview ? "Client portal preview" : "Project portal"}
        meta={
          isTeamPreview
            ? "Activated client projects shown with your team account."
            : "Activated projects, deliverables, documents, and responsibilities."
        }
      />
      <div className="grid gap-4">
        {isTeamPreview ? (
          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Team preview mode uses your admin session. To test a true client account, sign in with the client email used on the project.
              </p>
            </CardContent>
          </Card>
        ) : null}
        {result.setupRequired ? <SetupRequired message={result.error} /> : null}
        <ProjectsList projects={activeProjects} mode="client" />
      </div>
    </AppWorkspace>
  );
}

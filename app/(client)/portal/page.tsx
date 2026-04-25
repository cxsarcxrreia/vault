import { PageHeader } from "@/components/layout/page-header";
import { ProjectsList } from "@/components/project/projects-list";
import { SetupRequired } from "@/components/shared/setup-required";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentProfile, getPortalProjects } from "@/features/projects/queries";

export default async function PortalPage() {
  const [profile, result] = await Promise.all([getCurrentProfile(), getPortalProjects()]);
  const activeProjects = result.data;
  const isTeamPreview = profile?.user_type === "team";

  return (
    <>
      <PageHeader
        eyebrow={isTeamPreview ? "Team preview" : "Client"}
        title={isTeamPreview ? "Client portal preview" : "Project portal"}
        description={
          isTeamPreview
            ? "You are viewing activated client projects with your team account. Real clients only see projects mapped to their client user."
            : "Your activated projects, current phase, deliverables, documents, and responsibilities."
        }
      />
      <div className="grid gap-4 p-6">
        {isTeamPreview ? (
          <Card>
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
    </>
  );
}

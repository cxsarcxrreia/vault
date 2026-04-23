import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { SetupRequired } from "@/components/shared/setup-required";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentProfile, getPortalProjects } from "@/features/projects/queries";
import { getMainProjectState, getProjectStateTone } from "@/features/projects/state";

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
        {activeProjects.length ? activeProjects.map((project) => (
          <Link key={project.id} href={`/portal/project/${project.id}`}>
            <Card className="transition-colors hover:bg-muted/40">
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{project.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Current phase: {project.currentPhase}</p>
                </div>
                <Badge tone={getProjectStateTone(project.status)}>{getMainProjectState(project)}</Badge>
              </CardContent>
            </Card>
          </Link>
        )) : (
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">No activated projects are visible for this account yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

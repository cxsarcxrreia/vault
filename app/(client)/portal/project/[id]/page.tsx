import { ContentSection } from "@/components/layout/content-section";
import { PageHeader } from "@/components/layout/page-header";
import { DeliverablesList } from "@/components/deliverables/deliverables-list";
import { DocumentList } from "@/components/documents/document-list";
import { ProjectSummary } from "@/components/project/project-summary";
import { MacroTimeline } from "@/components/project/timeline";
import { ResponsibilityList } from "@/components/responsibilities/responsibility-list";
import { FormMessage } from "@/components/shared/form-message";
import { SetupRequired } from "@/components/shared/setup-required";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentProfile, getProjectDetail } from "@/features/projects/queries";
import { getMainProjectState } from "@/features/projects/state";

type PortalProjectPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalProjectPage({ params, searchParams }: PortalProjectPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const error = typeof query.error === "string" ? query.error : null;
  const updated = typeof query.updated === "string" ? query.updated : null;
  const [profile, result] = await Promise.all([getCurrentProfile(), getProjectDetail(id)]);
  const project = result.data;
  const isTeamPreview = profile?.user_type === "team";
  const clientMode = project?.status === "active" && !isTeamPreview ? "client" : "readonly";

  return (
    <>
      <PageHeader
        eyebrow={isTeamPreview ? "Team preview" : "Client project"}
        title={project?.name ?? "Project"}
        description={
          isTeamPreview
            ? "You are previewing the client portal while signed in as a team user."
            : "A simple view of what is happening now, what needs attention, and where key assets live."
        }
      />
      <div className="space-y-8 p-6">
        {isTeamPreview ? (
          <FormMessage type="info">
            Team preview mode. Client-only approve and revision actions should be tested by signing in with the client email.
          </FormMessage>
        ) : null}
        {project && project.status !== "active" ? (
          <FormMessage type="info">
            This project is {getMainProjectState(project).toLowerCase()}. Deliverables are available in read-only mode.
          </FormMessage>
        ) : null}
        {error ? <FormMessage type="error">{error}</FormMessage> : null}
        {updated ? <FormMessage type="success">Updated: {updated.replaceAll("-", " ")}</FormMessage> : null}
        {result.setupRequired ? <SetupRequired message={result.error} /> : null}
        {!project ? (
          <FormMessage type="error">{result.error ?? "Project not found."}</FormMessage>
        ) : (
          <>
        <ProjectSummary project={project} />
        <ContentSection title="Timeline" description="Macro project visibility only. Revisions and approvals stay in deliverables.">
          <MacroTimeline phases={project.phases} />
        </ContentSection>
        <ContentSection title="Deliverables" description="Review links, revision availability, and approval state.">
          <DeliverablesList deliverables={project.deliverables} projectId={project.id} mode={clientMode} />
        </ContentSection>
        <ContentSection title="Documents" description="Important project documents and summaries.">
          <DocumentList documents={project.documents.filter((document) => document.visibleToClient)} />
        </ContentSection>
        <ContentSection title="Responsibilities" description="Who owns each part of the work.">
          <ResponsibilityList items={project.responsibilities} />
        </ContentSection>
        {project.supportsCalendar ? (
          <ContentSection title="Calendar" description="Placeholder for recurring retainer cycles.">
            <Card>
              <CardContent>
                <p className="text-sm text-muted-foreground">Calendar visibility will be added for recurring retainers.</p>
              </CardContent>
            </Card>
          </ContentSection>
        ) : null}
          </>
        )}
      </div>
    </>
  );
}

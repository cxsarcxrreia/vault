import { ContentSection } from "@/components/layout/content-section";
import { PageHeader } from "@/components/layout/page-header";
import { DeliverableApprovalCount } from "@/components/deliverables/deliverable-approval-count";
import { DeliverablesList } from "@/components/deliverables/deliverables-list";
import { DocumentList } from "@/components/documents/document-list";
import { ProjectCompletionSummary } from "@/components/project/project-completion-summary";
import { RecentClientProjectTracker } from "@/components/project/recent-project-tracker";
import { ProjectSummary } from "@/components/project/project-summary";
import { MacroTimeline, MacroTimelineViewToggle, type MacroTimelineDisplayMode } from "@/components/project/timeline";
import { ResponsibilityList } from "@/components/responsibilities/responsibility-list";
import { FormMessage } from "@/components/shared/form-message";
import { SetupRequired } from "@/components/shared/setup-required";
import { Card, CardContent } from "@/components/ui/card";
import { getDocumentPhaseOrderForProjectPhases, normalizeDocumentPhaseKey } from "@/features/documents/phases";
import { getCurrentProfile, getProjectDetail } from "@/features/projects/queries";
import { getMainProjectState } from "@/features/projects/state";

type PortalProjectPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const portalSectionUpdates: Record<string, string[]> = {
  deliverables: ["deliverable-approved", "revision-requested"]
};

function getUpdateMessage(updated: string | null) {
  return updated ? `Updated: ${updated.replaceAll("-", " ")}` : null;
}

function matchesSectionUpdate(updated: string | null, section: keyof typeof portalSectionUpdates) {
  return updated ? portalSectionUpdates[section].includes(updated) : false;
}

export default async function PortalProjectPage({ params, searchParams }: PortalProjectPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const error = typeof query.error === "string" ? query.error : null;
  const updated = typeof query.updated === "string" ? query.updated : null;
  const commentsFocusId = typeof query.comments === "string" ? query.comments : null;
  const shouldOpenDeliverableComments = updated === "revision-requested";
  const timelineView: MacroTimelineDisplayMode = query.timeline === "cards" ? "cards" : "nodes";
  const selectedDocumentPhase = normalizeDocumentPhaseKey(typeof query.phase === "string" ? query.phase : null);
  const [profile, result] = await Promise.all([getCurrentProfile(), getProjectDetail(id)]);
  const project = result.data;
  const isTeamPreview = profile?.user_type === "team";
  const clientMode = project?.status === "active" && !isTeamPreview ? "client" : "readonly";
  const basePath = project ? `/portal/project/${project.id}` : `/portal/project/${id}`;
  const updateMessage = getUpdateMessage(updated);
  const hasMappedSectionUpdate = updated ? Object.values(portalSectionUpdates).some((values) => values.includes(updated)) : false;
  const documentPhaseOrder = project ? getDocumentPhaseOrderForProjectPhases(project.phases) : [];

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
        {updated && !hasMappedSectionUpdate ? <FormMessage type="success" autoDismissMs={5000}>{updateMessage}</FormMessage> : null}
        {result.setupRequired ? <SetupRequired message={result.error} /> : null}
        {!project ? (
          <FormMessage type="error">{result.error ?? "Project not found."}</FormMessage>
        ) : (
          <>
        <RecentClientProjectTracker
          project={{
            id: project.id,
            name: project.name,
            state: getMainProjectState(project)
          }}
        />
        <div id="project-summary" className="scroll-mt-6">
          <ProjectSummary project={project} />
        </div>
        <ContentSection
          title="Timeline"
          description="Macro project visibility only. Revisions and approvals stay in deliverables."
          actions={
            <MacroTimelineViewToggle
              basePath={basePath}
              projectId={project.id}
              currentView={timelineView}
              selectedPhaseKey={selectedDocumentPhase}
            />
          }
        >
          <MacroTimeline
            phases={project.phases}
            basePath={basePath}
            displayMode={timelineView}
            isProjectPaused={project.status === "paused"}
            mode="readonly"
            selectedPhaseKey={selectedDocumentPhase}
          />
        </ContentSection>
        <ContentSection
          id="deliverables"
          title={
            <span className="inline-flex items-center gap-2">
              Deliverables
              <DeliverableApprovalCount deliverables={project.deliverables} />
            </span>
          }
          description="Review links, revision availability, and approval state."
        >
          {matchesSectionUpdate(updated, "deliverables") ? <FormMessage type="success" autoDismissMs={5000}>{updateMessage}</FormMessage> : null}
          <DeliverablesList
            deliverables={project.deliverables}
            projectId={project.id}
            mode={clientMode}
            commentsDefaultOpen={shouldOpenDeliverableComments}
            commentsFocusId={commentsFocusId}
          />
        </ContentSection>
        <ContentSection id="documents" title="Documents" description="Important project documents and summaries, grouped by project phase.">
          <DocumentList
            documents={project.documents.filter((document) => document.visibleToClient)}
            activePhaseKey={selectedDocumentPhase}
            phaseOrder={documentPhaseOrder}
            basePath={basePath}
            timelineView={timelineView}
          />
        </ContentSection>
        <ContentSection id="responsibilities" title="Responsibilities" description="Who owns each part of the work.">
          <ResponsibilityList items={project.responsibilities} />
        </ContentSection>
        <ContentSection id="project-completion" title="Completion" description="Final handoff status across approvals and shared documents.">
          <ProjectCompletionSummary project={project} />
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

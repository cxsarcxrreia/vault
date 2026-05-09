import { ContentSection } from "@/components/layout/content-section";
import { PageHeader } from "@/components/layout/page-header";
import { DeliverableApprovalCount } from "@/components/deliverables/deliverable-approval-count";
import { DeliverableForm } from "@/components/deliverables/deliverable-form";
import { DeliverablesList } from "@/components/deliverables/deliverables-list";
import { DocumentList } from "@/components/documents/document-list";
import { ProjectActivationPanel } from "@/components/project/project-activation-panel";
import { ProjectCompletionSummary } from "@/components/project/project-completion-summary";
import { ProjectManageMenu } from "@/components/project/project-manage-menu";
import { RecentAdminProjectTracker } from "@/components/project/recent-project-tracker";
import { ProjectSummary } from "@/components/project/project-summary";
import { MacroTimeline, MacroTimelineViewToggle, type MacroTimelineDisplayMode } from "@/components/project/timeline";
import { ResponsibilityList } from "@/components/responsibilities/responsibility-list";
import { FormMessage } from "@/components/shared/form-message";
import { SetupRequired } from "@/components/shared/setup-required";
import { getDocumentPhaseOrderForProjectPhases, normalizeDocumentPhaseKey } from "@/features/documents/phases";
import { getProjectDetail } from "@/features/projects/queries";
import { getResponsibilityPresetsForTemplate } from "@/features/projects/responsibilities";
import { getMainProjectState } from "@/features/projects/state";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const sectionUpdates: Record<string, string[]> = {
  activation: ["deal-status", "payment-confirmed", "activated", "client-access-synced"],
  timeline: ["timeline-started", "timeline-completed", "timeline-reset", "timeline-status-updated"],
  deliverables: [
    "deliverable-created",
    "deliverable-deleted",
    "deliverable-link-updated",
    "deliverable-date-updated",
    "deliverable-state-updated",
    "deliverable-status-updated",
    "manual-revision-logged",
    "deliverable-resubmitted",
    "approved-on-behalf",
    "approval-undone"
  ],
  documents: ["document-added", "document-deleted"],
  responsibilities: ["responsibility-added", "responsibility-updated", "responsibility-deleted"],
  projectState: ["paused", "resumed", "archived", "restored"]
};

function getUpdateMessage(updated: string | null) {
  return updated ? `Updated: ${updated.replaceAll("-", " ")}` : null;
}

function matchesSectionUpdate(updated: string | null, section: keyof typeof sectionUpdates) {
  return updated ? sectionUpdates[section].includes(updated) : false;
}

export default async function AdminProjectPage({ params, searchParams }: ProjectPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const error = typeof query.error === "string" ? query.error : null;
  const updated = typeof query.updated === "string" ? query.updated : null;
  const created = typeof query.created === "string" ? query.created : null;
  const commentsFocusId = typeof query.comments === "string" ? query.comments : null;
  const shouldOpenDeliverableComments =
    updated === "manual-revision-logged" ||
    updated === "deliverable-resubmitted" ||
    updated === "approval-undone";
  const timelineView: MacroTimelineDisplayMode = query.timeline === "cards" ? "cards" : "nodes";
  const selectedDocumentPhase = normalizeDocumentPhaseKey(typeof query.phase === "string" ? query.phase : null);
  const result = await getProjectDetail(id);
  const project = result.data;
  const basePath = project ? `/admin/projects/${project.id}` : `/admin/projects/${id}`;
  const updateMessage = getUpdateMessage(updated);
  const hasMappedSectionUpdate = updated ? Object.values(sectionUpdates).some((values) => values.includes(updated)) : false;
  const documentPhaseOrder = project ? getDocumentPhaseOrderForProjectPhases(project.phases) : [];

  return (
    <>
      <PageHeader
        eyebrow="Team project"
        title={project?.name ?? "Project"}
        description="Operational shell for draft setup, payment confirmation, activation, deliverables, documents, and responsibilities."
      />
      <div className="space-y-8 p-6">
        {error ? <FormMessage type="error">{error}</FormMessage> : null}
        {updated && !hasMappedSectionUpdate ? <FormMessage type="success" autoDismissMs={5000}>{updateMessage}</FormMessage> : null}
        {created ? <FormMessage type="success" autoDismissMs={5000}>Draft project created.</FormMessage> : null}
        {result.setupRequired ? <SetupRequired message={result.error} /> : null}
        {!project ? (
          <FormMessage type="error">{result.error ?? "Project not found."}</FormMessage>
        ) : (
          <>
        <RecentAdminProjectTracker
          project={{
            id: project.id,
            name: project.name,
            state: getMainProjectState(project),
            organizationId: project.organizationId
          }}
        />
        <div id="project-summary" className="scroll-mt-6">
          <ProjectSummary project={project} actions={<ProjectManageMenu project={project} />} />
        </div>
        {matchesSectionUpdate(updated, "projectState") ? <FormMessage type="success" autoDismissMs={5000}>{updateMessage}</FormMessage> : null}
        {matchesSectionUpdate(updated, "activation") ? <FormMessage type="success" autoDismissMs={5000}>{updateMessage}</FormMessage> : null}
        {project.activationState !== "activated" ? <ProjectActivationPanel project={project} /> : null}
        {matchesSectionUpdate(updated, "timeline") ? <FormMessage type="success" autoDismissMs={5000}>{updateMessage}</FormMessage> : null}
        <ContentSection
          title="Macro timeline"
          description="Timeline stays high level. Approval and revision loops live inside deliverables."
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
            projectId={project.id}
            basePath={basePath}
            displayMode={timelineView}
            isProjectPaused={project.status === "paused"}
            mode={project.status === "archived" ? "readonly" : "admin"}
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
          description="This is the operational center for review, approval, and revision state."
        >
          {matchesSectionUpdate(updated, "deliverables") ? <FormMessage type="success" autoDismissMs={5000}>{updateMessage}</FormMessage> : null}
          {project.status === "archived" ? (
            <FormMessage type="info">Archived projects are read-only. Restore this project before adding new deliverables.</FormMessage>
          ) : (
            <DeliverableForm projectId={project.id} />
          )}
          <DeliverablesList
            deliverables={project.deliverables}
            projectId={project.id}
            mode={project.status === "archived" ? "readonly" : "admin"}
            commentsDefaultOpen={shouldOpenDeliverableComments}
            commentsFocusId={commentsFocusId}
          />
        </ContentSection>
        <ContentSection id="documents" title="Documents" description="Documents are lightweight metadata records with external links, grouped by project phase.">
          {matchesSectionUpdate(updated, "documents") ? <FormMessage type="success" autoDismissMs={5000}>{updateMessage}</FormMessage> : null}
          <DocumentList
            documents={project.documents}
            projectId={project.id}
            mode={project.status === "archived" ? "readonly" : "admin"}
            activePhaseKey={selectedDocumentPhase}
            phaseOrder={documentPhaseOrder}
            basePath={basePath}
            timelineView={timelineView}
          />
        </ContentSection>
        <ContentSection id="responsibilities" title="Responsibilities" description="Clarifies what the agency owns, what the client owns, and what is shared.">
          {matchesSectionUpdate(updated, "responsibilities") ? <FormMessage type="success" autoDismissMs={5000}>{updateMessage}</FormMessage> : null}
          {!project.responsibilities.length ? (
            <FormMessage type="warning">
              Responsibility matrix needs to be completed before the client has clear ownership visibility.
            </FormMessage>
          ) : null}
          <ResponsibilityList
            items={project.responsibilities}
            projectId={project.id}
            presets={getResponsibilityPresetsForTemplate(project.templateName)}
            mode={project.status === "archived" ? "readonly" : "admin"}
          />
        </ContentSection>
        <ContentSection id="project-completion" title="Completion" description="Final handoff status across approvals and shared documents.">
          <ProjectCompletionSummary project={project} />
        </ContentSection>
          </>
        )}
      </div>
    </>
  );
}

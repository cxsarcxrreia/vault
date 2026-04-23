import { ContentSection } from "@/components/layout/content-section";
import { PageHeader } from "@/components/layout/page-header";
import { DeliverableForm } from "@/components/deliverables/deliverable-form";
import { DeliverablesList } from "@/components/deliverables/deliverables-list";
import { DocumentList } from "@/components/documents/document-list";
import { ProjectActivationPanel } from "@/components/project/project-activation-panel";
import { ProjectStatePanel } from "@/components/project/project-state-panel";
import { ProjectSummary } from "@/components/project/project-summary";
import { MacroTimeline } from "@/components/project/timeline";
import { ResponsibilityList } from "@/components/responsibilities/responsibility-list";
import { FormMessage } from "@/components/shared/form-message";
import { SetupRequired } from "@/components/shared/setup-required";
import { getProjectDetail } from "@/features/projects/queries";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminProjectPage({ params, searchParams }: ProjectPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const error = typeof query.error === "string" ? query.error : null;
  const updated = typeof query.updated === "string" ? query.updated : null;
  const created = typeof query.created === "string" ? query.created : null;
  const result = await getProjectDetail(id);
  const project = result.data;

  return (
    <>
      <PageHeader
        eyebrow="Team project"
        title={project?.name ?? "Project"}
        description="Operational shell for draft setup, payment confirmation, activation, deliverables, documents, and responsibilities."
      />
      <div className="space-y-8 p-6">
        {error ? <FormMessage type="error">{error}</FormMessage> : null}
        {updated ? <FormMessage type="success">Updated: {updated.replaceAll("-", " ")}</FormMessage> : null}
        {created ? <FormMessage type="success">Draft project created.</FormMessage> : null}
        {result.setupRequired ? <SetupRequired message={result.error} /> : null}
        {!project ? (
          <FormMessage type="error">{result.error ?? "Project not found."}</FormMessage>
        ) : (
          <>
        <ProjectSummary project={project} />
        <ProjectActivationPanel project={project} />
        <ContentSection title="Macro timeline" description="Timeline stays high level. Approval and revision loops live inside deliverables.">
          <MacroTimeline phases={project.phases} projectId={project.id} mode={project.status === "archived" ? "readonly" : "admin"} />
        </ContentSection>
        <ContentSection title="Deliverables" description="This is the operational center for review, approval, and revision state.">
          {project.status === "archived" ? (
            <FormMessage type="info">Archived projects are read-only. Restore this project before adding new deliverables.</FormMessage>
          ) : (
            <DeliverableForm projectId={project.id} />
          )}
          <DeliverablesList deliverables={project.deliverables} projectId={project.id} mode={project.status === "archived" ? "readonly" : "admin"} />
        </ContentSection>
        <ContentSection title="Documents" description="Documents are lightweight metadata records with external links.">
          <DocumentList documents={project.documents} />
        </ContentSection>
        <ContentSection title="Responsibilities" description="Clarifies what the agency owns, what the client owns, and what is shared.">
          <ResponsibilityList items={project.responsibilities} />
        </ContentSection>
        <ProjectStatePanel project={project} />
          </>
        )}
      </div>
    </>
  );
}

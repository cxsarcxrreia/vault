import type { Database } from "@/types/database.types";
import type { Deliverable, Project, ProjectDocument, ProjectPhase, ResponsibilityItem } from "@/types/domain";
import { DEFAULT_DOCUMENT_PHASE_KEY, normalizeDocumentPhaseKey } from "@/features/documents/phases";

type ClientRow = Pick<Database["public"]["Tables"]["clients"]["Row"], "name" | "primary_contact_email">;
type TemplateRow = Pick<Database["public"]["Tables"]["project_templates"]["Row"], "name" | "supports_calendar">;
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"] & {
  clients?: ClientRow | ClientRow[] | null;
  project_templates?: TemplateRow | TemplateRow[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function mapPhase(row: Database["public"]["Tables"]["project_phases"]["Row"]): ProjectPhase {
  return {
    id: row.id,
    name: row.name,
    phaseKey: row.phase_key,
    allowsDocuments: row.allows_documents,
    status: row.status,
    position: row.position
  };
}

export function mapDeliverable(
  row: Database["public"]["Tables"]["deliverables"]["Row"],
  comments: Database["public"]["Tables"]["deliverable_comments"]["Row"][] = []
): Deliverable {
  return {
    id: row.id,
    title: row.title,
    type: row.deliverable_type,
    status: row.status,
    expectedDeliveryDate: row.expected_delivery_date,
    expectedDeliveryDateChangedForRevision: row.expected_delivery_date_changed_for_revision,
    revisionLimit: row.revision_limit,
    revisionsRemaining: row.revisions_remaining,
    externalUrl: row.external_url,
    internalNotes: row.internal_notes,
    comments: comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      authorName: comment.author_name,
      type: comment.comment_type as "comment" | "revision_request",
      createdAt: comment.created_at
    }))
  };
}

export function mapDocument(row: Database["public"]["Tables"]["documents"]["Row"]): ProjectDocument {
  return {
    id: row.id,
    title: row.title,
    type: row.document_type,
    phaseKey: normalizeDocumentPhaseKey(row.phase_key) ?? DEFAULT_DOCUMENT_PHASE_KEY,
    externalUrl: row.external_url,
    visibleToClient: row.visible_to_client
  };
}

export function mapResponsibility(row: Database["public"]["Tables"]["responsibility_items"]["Row"]): ResponsibilityItem {
  return {
    id: row.id,
    title: row.title,
    owner: row.owner,
    notes: row.notes ?? undefined
  };
}

export function mapProject(
  row: ProjectRow,
  extras?: {
    phases?: ProjectPhase[];
    deliverables?: Deliverable[];
    documents?: ProjectDocument[];
    responsibilities?: ResponsibilityItem[];
  }
): Project {
  const client = firstRelation(row.clients);
  const template = firstRelation(row.project_templates);
  const phases = extras?.phases ?? [];
  const activePhases = phases.filter((phase) => phase.status === "active");
  const allPhasesComplete = phases.length > 0 && phases.every((phase) => phase.status === "complete");
  const currentPhase = activePhases.length
    ? activePhases.map((phase) => phase.name).join(", ")
    : allPhasesComplete
      ? "Project complete"
      : row.current_phase_key?.replaceAll("_", " ") ?? "Not started";

  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    clientName: client?.name ?? "Client",
    clientEmail: client?.primary_contact_email,
    summary: row.summary ?? "No summary yet.",
    status: row.status,
    archiveReason: row.archive_reason,
    preActivationStatus: row.pre_activation_status,
    activationState: row.activation_state,
    proposalToken: row.proposal_token,
    proposalApprovedAt: row.proposal_approved_at,
    proposalApprovedByEmail: row.proposal_approved_by_email,
    currentPhase,
    templateName: template?.name ?? row.service_type ?? "Custom project",
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    supportsCalendar: template?.supports_calendar ?? false,
    phases: extras?.phases ?? [],
    deliverables: extras?.deliverables ?? [],
    documents: extras?.documents ?? [],
    responsibilities: extras?.responsibilities ?? []
  };
}

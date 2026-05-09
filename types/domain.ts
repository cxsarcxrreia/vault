export type TeamRole = "owner" | "admin" | "member";
export type ClientRole = "client_owner" | "client_collaborator";
export type ProjectStatus = "draft" | "proposal_sent" | "payment_confirmed" | "active" | "paused" | "complete" | "archived";
export type ArchiveReason = "completed" | "cancelled" | "duplicate" | "expired";
export type DealStatus = "draft" | "proposal_sent" | "proposal_approved" | "payment_pending" | "payment_confirmed";
export type ActivationState = "internal_draft" | "proposal_approved" | "payment_confirmed" | "activated";
export type PhaseStatus = "not_started" | "active" | "complete";
export type DeliverableStatus =
  | "planned"
  | "in_progress"
  | "editing"
  | "ready_for_review"
  | "revision_requested"
  | "approved"
  | "delivered";
export type ResponsibilityOwner = "agency" | "client" | "external" | "shared";
export type DocumentPhaseKey = string;

export type TemplatePhaseDefinition = {
  name: string;
  phaseKey: string;
  allowsDocuments: boolean;
  isStandard?: boolean;
};

export type ProjectPhase = {
  id: string;
  name: string;
  phaseKey: string;
  allowsDocuments: boolean;
  status: PhaseStatus;
  position: number;
};

export type Deliverable = {
  id: string;
  title: string;
  type: string;
  status: DeliverableStatus;
  expectedDeliveryDate: string | null;
  expectedDeliveryDateChangedForRevision: boolean;
  revisionLimit: number;
  revisionsRemaining: number;
  externalUrl: string | null;
  internalNotes?: string | null;
  comments?: DeliverableComment[];
};

export type DeliverableComment = {
  id: string;
  body: string;
  authorName: string | null;
  type: "comment" | "revision_request";
  createdAt: string;
};

export type ProjectDocument = {
  id: string;
  title: string;
  type: string;
  phaseKey: DocumentPhaseKey;
  externalUrl: string;
  visibleToClient: boolean;
};

export type ResponsibilityItem = {
  id: string;
  title: string;
  owner: ResponsibilityOwner;
  notes?: string;
};

export type Client = {
  id: string;
  name: string;
  primaryContactEmail: string;
  status: "lead" | "active" | "archived";
  activeProjectId?: string | null;
};

export type ProjectTemplate = {
  id: string;
  name: string;
  slug: string;
  supportsCalendar: boolean;
  isCustom?: boolean;
  phaseDefinitions: TemplatePhaseDefinition[];
  defaultPhases: string[];
  deliverableTypeSuggestions: string[];
};

export type Project = {
  id: string;
  organizationId?: string;
  name: string;
  clientName: string;
  clientEmail?: string;
  summary: string;
  status: ProjectStatus;
  archiveReason?: ArchiveReason | null;
  preActivationStatus?: DealStatus;
  activationState: ActivationState;
  currentPhase: string;
  templateName: string;
  startsOn: string | null;
  endsOn: string | null;
  phases: ProjectPhase[];
  deliverables: Deliverable[];
  documents: ProjectDocument[];
  responsibilities: ResponsibilityItem[];
  supportsCalendar: boolean;
};

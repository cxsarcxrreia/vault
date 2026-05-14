import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import type { DealStatus, ActivationState, ProjectStatus } from "@/types/domain";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ProposalDocument = {
  id: string;
  title: string;
  type: string;
  externalUrl: string;
};

export type ProposalReview = {
  token: string;
  projectId: string;
  name: string;
  clientName: string;
  clientEmail: string;
  summary: string | null;
  serviceType: string | null;
  status: ProjectStatus;
  preActivationStatus: DealStatus;
  activationState: ActivationState;
  proposalApprovedAt: string | null;
  proposalApprovedByEmail: string | null;
  startsOn: string | null;
  endsOn: string | null;
  documents: ProposalDocument[];
};

export type ProposalReviewState = {
  data: ProposalReview | null;
  error: string | null;
};

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function getProposalState(proposal: ProposalReview) {
  if (proposal.proposalApprovedAt || proposal.preActivationStatus === "proposal_approved" || proposal.activationState === "proposal_approved") {
    return "approved";
  }

  if (
    proposal.status === "proposal_sent" &&
    proposal.preActivationStatus === "proposal_sent" &&
    proposal.activationState === "internal_draft"
  ) {
    return "ready";
  }

  return "unavailable";
}

export async function getProposalByToken(token: string): Promise<ProposalReviewState> {
  if (!uuidPattern.test(token)) {
    return { data: null, error: "This proposal link is not valid." };
  }

  let supabase: ReturnType<typeof createSupabaseServiceRoleClient>;

  try {
    supabase = createSupabaseServiceRoleClient();
  } catch {
    return { data: null, error: "Proposal review is not configured yet." };
  }

  const proposalSelect = `
    id,
    name,
    summary,
    service_type,
    status,
    pre_activation_status,
    activation_state,
    proposal_token,
    proposal_approved_at,
    proposal_approved_by_email,
    starts_on,
    ends_on,
    clients(name, primary_contact_email),
    documents(id, title, document_type, external_url, visible_to_client, phase_key)
  `;
  const fallbackProposalSelect = `
    id,
    name,
    summary,
    service_type,
    status,
    pre_activation_status,
    activation_state,
    proposal_token,
    proposal_approved_at,
    starts_on,
    ends_on,
    clients(name, primary_contact_email),
    documents(id, title, document_type, external_url, visible_to_client, phase_key)
  `;

  const proposalResult = await supabase
    .from("projects")
    .select(proposalSelect)
    .eq("proposal_token", token)
    .maybeSingle();
  let data: any = proposalResult.data;
  let error = proposalResult.error;

  if (error && error.message.includes("proposal_approved_by_email")) {
    const fallbackResult = await supabase
      .from("projects")
      .select(fallbackProposalSelect)
      .eq("proposal_token", token)
      .maybeSingle();

    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (error) {
    return { data: null, error: "Unable to load this proposal." };
  }

  if (!data) {
    return { data: null, error: "This proposal link is not available." };
  }

  const client = firstRelation(data.clients);
  const proposalDocuments = (data.documents ?? [])
    .filter((document: any) => document.visible_to_client && document.phase_key === "proposal_scope")
    .map((document: any) => ({
      id: document.id,
      title: document.title,
      type: document.document_type,
      externalUrl: document.external_url
    }));

  return {
    data: {
      token: data.proposal_token,
      projectId: data.id,
      name: data.name,
      clientName: client?.name ?? "Client",
      clientEmail: client?.primary_contact_email ?? "",
      summary: data.summary,
      serviceType: data.service_type,
      status: data.status,
      preActivationStatus: data.pre_activation_status,
      activationState: data.activation_state,
      proposalApprovedAt: data.proposal_approved_at,
      proposalApprovedByEmail: "proposal_approved_by_email" in data ? data.proposal_approved_by_email : null,
      startsOn: data.starts_on,
      endsOn: data.ends_on,
      documents: proposalDocuments
    },
    error: null
  };
}

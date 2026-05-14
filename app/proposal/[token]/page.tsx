import { CheckCircle2, ExternalLink, FileText, LockKeyhole } from "lucide-react";
import { PublicHeader, PublicNav, PublicPage, PublicPanel, PublicWorkspace } from "@/components/layout/public-shell";
import { ConfirmSubmitButton } from "@/components/shared/confirm-submit-button";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { approveProposal } from "@/features/proposals/actions";
import { getProposalByToken, getProposalState, type ProposalReview } from "@/features/proposals/queries";
import { formatDate } from "@/lib/utils/format";

type ProposalPageProps = {
  params: Promise<{ token: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getStatusBadge(proposal: ProposalReview) {
  const state = getProposalState(proposal);

  if (state === "approved") {
    return <Badge tone="active">Proposal approved</Badge>;
  }

  if (state === "ready") {
    return <Badge tone="review">Ready for approval</Badge>;
  }

  return <Badge>Not open</Badge>;
}

function getStatusCopy(proposal: ProposalReview) {
  const state = getProposalState(proposal);

  if (state === "approved") {
    return "This proposal has been approved. The team will confirm payment or deposit before opening the client portal.";
  }

  if (state === "ready") {
    return "Review the proposal documents and approve when everything is ready. The client portal opens only after payment or deposit is confirmed by the team.";
  }

  return "This proposal is not currently open for approval. The team may still be preparing it, or the project has moved past proposal review.";
}

export default async function ProposalPage({ params, searchParams }: ProposalPageProps) {
  const { token } = await params;
  const query = searchParams ? await searchParams : {};
  const error = typeof query.error === "string" ? query.error : null;
  const updated = typeof query.updated === "string" ? query.updated : null;
  const result = await getProposalByToken(token);
  const proposal = result.data;

  return (
    <PublicPage>
      <PublicNav />
      <PublicWorkspace width="wide" className="grid min-h-[calc(100vh-5rem)] items-center py-12 md:py-16">
        {proposal ? (
          <div className="grid gap-10 lg:grid-cols-[0.86fr_1fr] lg:items-center">
            <PublicHeader
              label="Proposal review"
              title={proposal.name}
              description={proposal.summary ?? "Review the proposed scope and approve when the project is ready to move toward payment confirmation."}
            />

            <div className="space-y-4">
              {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</div> : null}
              {updated === "approved" ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
                  Proposal approved.
                </div>
              ) : null}
              {updated === "already-approved" ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
                  This proposal was already approved.
                </div>
              ) : null}

              <PublicPanel className="p-0">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 p-5">
                  <div>
                    <p className="text-[12px] font-medium leading-none text-neutral-900/45">{proposal.clientName}</p>
                    <h1 className="mt-1.5 text-[17px] font-semibold text-neutral-900">Proposal approval</h1>
                  </div>
                  {getStatusBadge(proposal)}
                </div>

                <div className="space-y-5 p-5">
                  <div className="grid gap-3 text-[13px] text-neutral-600 sm:grid-cols-2">
                    <div>
                      <p className="font-medium text-neutral-900">Service</p>
                      <p className="mt-1">{proposal.serviceType ?? "Custom project"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">Timeline</p>
                      <p className="mt-1">
                        {proposal.startsOn || proposal.endsOn
                          ? `${formatDate(proposal.startsOn)} to ${formatDate(proposal.endsOn)}`
                          : "To be confirmed"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white">
                        {getProposalState(proposal) === "approved" ? (
                          <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
                        ) : (
                          <LockKeyhole className="size-4 text-neutral-500" aria-hidden="true" />
                        )}
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-neutral-900">{getStatusCopy(proposal)}</p>
                        {proposal.proposalApprovedAt ? (
                          <p className="mt-2 text-[12px] leading-5 text-neutral-500">
                            Approved by {proposal.proposalApprovedByEmail ?? proposal.clientEmail} on {formatDate(proposal.proposalApprovedAt)}.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <section className="space-y-3">
                    <h2 className="text-[14px] font-semibold text-neutral-900">Proposal documents</h2>
                    {proposal.documents.length ? (
                      <div className="divide-y rounded-xl border border-neutral-200">
                        {proposal.documents.map((document) => (
                          <div key={document.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-neutral-100">
                                <FileText className="size-4 text-neutral-500" aria-hidden="true" />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-semibold text-neutral-900">{document.title}</p>
                                <p className="mt-1 text-[12px] text-neutral-500">{document.type}</p>
                              </div>
                            </div>
                            <ButtonLink href={document.externalUrl} variant="outline" target="_blank" rel="noreferrer" className="rounded-lg text-[13px]">
                              Open
                              <ExternalLink className="ml-2 size-4" aria-hidden="true" />
                            </ButtonLink>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-3 text-[13px] text-neutral-500">
                        No proposal documents are attached to this link yet.
                      </p>
                    )}
                  </section>

                  {getProposalState(proposal) === "ready" ? (
                    <form action={approveProposal} className="border-t border-neutral-200 pt-5">
                      <input type="hidden" name="token" value={proposal.token} />
                      <ConfirmSubmitButton
                        triggerLabel="Approve proposal"
                        title="Approve proposal?"
                        description="This confirms the proposal as approved. The project portal will still stay closed until the team confirms payment or deposit and activates access."
                        confirmLabel="Approve"
                        triggerVariant="primary"
                        confirmVariant="success"
                        className="w-full rounded-lg text-[13px]"
                      />
                    </form>
                  ) : null}
                </div>
              </PublicPanel>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-lg">
            <PublicHeader
              label="Proposal review"
              title="This proposal link is unavailable"
              description={result.error ?? "The proposal may have expired, moved forward, or not been shared yet."}
              align="center"
            />
          </div>
        )}
      </PublicWorkspace>
    </PublicPage>
  );
}

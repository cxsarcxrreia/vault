import { CalendarDays, Check, ChevronDown, ExternalLink, Pencil, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmitButton } from "@/components/shared/confirm-submit-button";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  approveDeliverable,
  approveDeliverableOnBehalf,
  deleteDeliverable,
  logManualRevision,
  requestDeliverableRevision,
  resubmitDeliverable,
  undoDeliverableApproval,
  updateDeliverableExpectedDeliveryDate,
  updateDeliverableLink,
  updateDeliverableStatus
} from "@/features/projects/actions";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import type { Deliverable, DeliverableStatus } from "@/types/domain";

const statusTone = {
  planned: "neutral",
  in_progress: "waiting",
  editing: "waiting",
  ready_for_review: "waiting",
  revision_requested: "waiting",
  approved: "active",
  delivered: "active"
} as const;

const statusLabel = {
  planned: "Not started",
  in_progress: "In production",
  editing: "Editing",
  ready_for_review: "Awaiting Client's Review",
  revision_requested: "Revision requested",
  approved: "Approved",
  delivered: "Delivered"
} as const;

const statusOptions: DeliverableStatus[] = [
  "planned",
  "in_progress",
  "editing",
  "revision_requested",
];

const lockedManualStatusStates = new Set<DeliverableStatus>([
  "ready_for_review",
  "revision_requested",
  "approved",
  "delivered"
]);

function DeliverableStatusBadge({
  deliverable,
  projectId,
  mode,
  label
}: {
  deliverable: Deliverable;
  projectId?: string;
  mode: "admin" | "client" | "readonly";
  label: string;
}) {
  if (mode !== "admin" || !projectId || lockedManualStatusStates.has(deliverable.status)) {
    return <Badge tone={statusTone[deliverable.status]}>{label}</Badge>;
  }

  const otherStatuses = statusOptions.filter((status) => status !== deliverable.status);

  return (
    <details className="group relative">
      <summary className="list-none marker:hidden">
        <span className="inline-flex cursor-pointer items-center gap-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <Badge tone={statusTone[deliverable.status]}>{label}</Badge>
          <ChevronDown className="size-3 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
        </span>
      </summary>
      <form action={updateDeliverableStatus} className="absolute right-0 top-full z-30 mt-2 w-52 rounded-md border bg-background p-1 shadow-lg">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="deliverableId" value={deliverable.id} />
        {otherStatuses.map((status) => (
          <button
            key={status}
            type="submit"
            name="status"
            value={status}
            className="flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span>{statusLabel[status]}</span>
            <span className={cn("size-2 rounded-full", statusTone[status] === "active" ? "bg-emerald-500" : statusTone[status] === "waiting" ? "bg-amber-500" : "bg-muted-foreground/40")} />
          </button>
        ))}
      </form>
    </details>
  );
}

export function DeliverableCard({
  deliverable,
  projectId,
  mode = "readonly",
  commentsDefaultOpen = false
}: {
  deliverable: Deliverable;
  projectId?: string;
  mode?: "admin" | "client" | "readonly";
  commentsDefaultOpen?: boolean;
}) {
  const isReadyForClientReview = deliverable.status === "ready_for_review";
  const isRevisionPending = deliverable.status === "revision_requested";
  const isApproved = deliverable.status === "approved";
  const canRequestRevision = isReadyForClientReview && deliverable.revisionsRemaining > 0;
  const canApprove = isReadyForClientReview;
  const badgeLabel =
    mode === "client" && deliverable.status === "ready_for_review"
      ? "Awaiting your review"
      : statusLabel[deliverable.status];

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{deliverable.type}</p>
            <h3 className="mt-1 font-semibold">{deliverable.title}</h3>
          </div>
          <DeliverableStatusBadge deliverable={deliverable} projectId={projectId} mode={mode} label={badgeLabel} />
        </div>
        <dl
          className={cn(
            "grid gap-3 text-sm text-muted-foreground transition-opacity sm:grid-cols-2",
            isApproved && "opacity-55"
          )}
        >
          <div>
            <dt className="font-medium text-foreground">Expected delivery</dt>
            <dd className="mt-1 flex items-center gap-2">
              <span>{formatDate(deliverable.expectedDeliveryDate)}</span>
              {mode === "client" && deliverable.expectedDeliveryDateChangedForRevision ? (
                <span className="group/tooltip relative inline-flex items-center text-amber-700">
                  <TriangleAlert className="size-4" aria-hidden="true" />
                  <span className="sr-only">Expected delivery date changed because of revision request</span>
                  <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-64 -translate-x-1/2 rounded-md border bg-background px-3 py-2 text-left text-[11px] font-normal text-foreground shadow-lg group-hover/tooltip:block">
                    Expected Date changed because a Revision was requested from your end.
                  </span>
                </span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Revisions</dt>
            <dd>
              {deliverable.revisionsRemaining} of {deliverable.revisionLimit} remaining
            </dd>
          </div>
        </dl>
        {deliverable.internalNotes && mode === "admin" ? (
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{deliverable.internalNotes}</div>
        ) : null}
        <div className="space-y-3">
          {deliverable.externalUrl ? (
            <ButtonLink
              href={deliverable.externalUrl}
              variant="outline"
              target="_blank"
              rel="noreferrer"
              className="border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100"
            >
              <ExternalLink className="mr-2 size-4" />
              Open link
            </ButtonLink>
          ) : mode === "client" ? (
            <p className="text-sm font-medium text-sky-700">Asset link will appear here when ready.</p>
          ) : null}
          {mode === "admin" && projectId ? (
            <details className="group rounded-md open:border open:p-3">
              <summary className="inline-flex h-10 cursor-pointer list-none items-center justify-center rounded-md border border-sky-200 bg-sky-50 px-3 text-sm font-medium text-sky-800 transition-colors hover:bg-sky-100 marker:hidden">
                <Pencil className="mr-2 size-4" />
                Edit link
              </summary>
              <form action={updateDeliverableLink} className="mt-3 grid w-full gap-2 rounded-md bg-background sm:grid-cols-[1fr_auto]">
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="deliverableId" value={deliverable.id} />
                <input
                  name="externalUrl"
                  type="url"
                  defaultValue={deliverable.externalUrl ?? ""}
                  placeholder="https://drive.google.com/..."
                  className="h-10 min-w-0 rounded-md border bg-background px-3 text-sm"
                />
                <Button type="submit" variant="outline">Save link</Button>
              </form>
            </details>
          ) : null}
          {mode === "admin" && projectId ? (
            <details className="group rounded-md open:border open:p-3">
              <summary className="inline-flex h-10 cursor-pointer list-none items-center justify-center rounded-md border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted marker:hidden">
                <CalendarDays className="mr-2 size-4" />
                Change delivery date
              </summary>
              <form action={updateDeliverableExpectedDeliveryDate} className="mt-3 grid w-full gap-3 rounded-md bg-background sm:grid-cols-[1fr_auto]">
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="deliverableId" value={deliverable.id} />
                <div className="space-y-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Expected delivery</span>
                    <input
                      name="expectedDeliveryDate"
                      type="date"
                      defaultValue={deliverable.expectedDeliveryDate ?? ""}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      name="changedForRevision"
                      value="1"
                      type="checkbox"
                      defaultChecked={deliverable.expectedDeliveryDateChangedForRevision}
                      className="size-4 rounded border"
                    />
                    Changed because of a revision request
                  </label>
                </div>
                <Button type="submit" variant="outline" className="self-end">Save date</Button>
              </form>
            </details>
          ) : null}
        </div>
        {isRevisionPending ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Revision pending. The team needs to resubmit this deliverable before the client can approve or request another revision.
          </div>
        ) : null}
        {mode === "client" && projectId ? (
          <div className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-medium">Client actions</h4>

            <div className="space-y-3">
              {canRequestRevision ? (
                <details className="group rounded-md open:border open:p-3">
                  <summary className="inline-flex h-10 cursor-pointer list-none items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/80 marker:hidden">
                    <span className="group-open:hidden">Request revision</span>
                    <span className="hidden group-open:inline">Hide</span>
                  </summary>

                  <form
                    action={requestDeliverableRevision}
                    className="mt-3 space-y-3 rounded-md bg-background"
                  >
                    <input type="hidden" name="projectId" value={projectId} />
                    <input type="hidden" name="deliverableId" value={deliverable.id} />

                    <textarea
                      name="body"
                      required
                      rows={3}
                      placeholder="Describe the requested revision"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />

                    <Button type="submit" variant="secondary">
                      Send revision request
                    </Button>
                  </form>
                </details>
              ) : (
                <Button type="button" variant="secondary" className="w-fit" disabled>
                  Request revision
                </Button>
              )}

              <form action={approveDeliverable} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="deliverableId" value={deliverable.id} />

                <ConfirmSubmitButton
                  triggerLabel="Approve deliverable"
                  title="Approve deliverable?"
                  description="This confirms the deliverable as approved by the client. This is a final approval step for this revision state."
                  confirmLabel="Approve"
                  triggerVariant="outline"
                  confirmVariant="success"
                  className="hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                  disabled={!canApprove || isApproved}
                />
              </form>
            </div>
          </div>
        ) : null}
        {mode === "admin" && projectId ? (
          <div className="grid gap-3 border-t pt-4">
            <h4 className="text-sm font-medium">Admin actions</h4>
            {isApproved ? (
              <form action={undoDeliverableApproval} className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/20 p-3">
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="deliverableId" value={deliverable.id} />
                <Button type="button" variant="success" disabled>
                  <Check className="mr-2 size-4" />
                  Approved
                </Button>
                <Button type="submit" variant="outline">Undo approval</Button>
              </form>
            ) : (
              <details className="group rounded-md open:border open:p-3">
                <summary className="inline-flex h-10 cursor-pointer list-none items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100 marker:hidden">
                  Mark approved
                </summary>
                <form action={approveDeliverableOnBehalf} className="mt-3 grid gap-3 rounded-md bg-background md:grid-cols-[160px_1fr_auto]">
                  <input type="hidden" name="projectId" value={projectId} />
                  <input type="hidden" name="deliverableId" value={deliverable.id} />
                  <select name="approvalSource" defaultValue="whatsapp" className="h-10 rounded-md border bg-background px-3 text-sm">
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="call">Call</option>
                    <option value="admin_override">Admin override</option>
                  </select>
                  <input name="notes" placeholder="Approval note or source detail" className="h-10 rounded-md border bg-background px-3 text-sm" />
                  <Button type="submit" variant="success">
                    Confirm approval
                  </Button>
                </form>
              </details>
            )}
            {isReadyForClientReview && deliverable.revisionsRemaining > 0 ? (
              <details className="group rounded-md open:border open:p-3">
                <summary className="inline-flex h-10 cursor-pointer list-none items-center justify-center rounded-md border border-amber-200 bg-amber-50 px-4 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100 marker:hidden">
                  Log manual revision
                </summary>
                <form action={logManualRevision} className="mt-3 grid gap-3 rounded-md bg-background md:grid-cols-[160px_1fr_auto]">
                  <input type="hidden" name="projectId" value={projectId} />
                  <input type="hidden" name="deliverableId" value={deliverable.id} />
                  <select name="source" defaultValue="whatsapp" className="h-10 rounded-md border bg-background px-3 text-sm">
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="call">Call</option>
                    <option value="admin_override">Admin note</option>
                  </select>
                  <input name="body" placeholder="Optional revision note" className="h-10 rounded-md border bg-background px-3 text-sm" />
                  <Button type="submit" variant="warning">Log revision</Button>
                </form>
              </details>
            ) : null}
          </div>
        ) : null}
        {mode === "admin" && projectId && isRevisionPending ? (
          <form action={resubmitDeliverable} className="border-t pt-4">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="deliverableId" value={deliverable.id} />
            <Button type="submit" variant="secondary">Mark resubmitted</Button>
          </form>
        ) : null}
        {deliverable.comments?.length ? (
          <details className="group border-t pt-4" open={commentsDefaultOpen}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 marker:hidden">
              <span className="flex items-center gap-2">
                <span>Comments</span>
                <span className="text-xs font-normal text-muted-foreground">({deliverable.comments.length})</span>
              </span>
              <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                <span className="group-open:hidden">Show comments</span>
                <span className="hidden group-open:inline">Hide comments</span>
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>
            <div className="mt-3 space-y-2">
              {deliverable.comments.map((comment) => (
                <div key={comment.id} className="rounded-md bg-muted p-3 text-sm">
                  <p className="text-muted-foreground">{comment.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {comment.authorName ?? "User"} - {formatDate(comment.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </details>
        ) : null}
        {mode === "admin" && projectId ? (
          <form action={deleteDeliverable} className={deliverable.comments?.length ? "" : "border-t pt-4"}>
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="deliverableId" value={deliverable.id} />
            <ConfirmSubmitButton
              triggerLabel="Delete"
              title="Delete deliverable?"
              description="This permanently removes this deliverable, including its project-level record and comment history on this page. This action cannot be undone."
              confirmLabel="Delete"
              triggerVariant="danger"
              confirmVariant="danger"
            />
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}

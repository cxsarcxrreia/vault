import { Check, ExternalLink, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  approveDeliverable,
  approveDeliverableOnBehalf,
  logManualRevision,
  requestDeliverableRevision,
  resubmitDeliverable,
  undoDeliverableApproval,
  updateDeliverableLink
} from "@/features/projects/actions";
import { formatDate } from "@/lib/utils/format";
import type { Deliverable } from "@/types/domain";

const statusTone = {
  planned: "neutral",
  in_progress: "waiting",
  ready_for_review: "review",
  revision_requested: "waiting",
  approved: "active",
  delivered: "active"
} as const;

export function DeliverableCard({
  deliverable,
  projectId,
  mode = "readonly"
}: {
  deliverable: Deliverable;
  projectId?: string;
  mode?: "admin" | "client" | "readonly";
}) {
  const isReadyForClientReview = deliverable.status === "ready_for_review";
  const isRevisionPending = deliverable.status === "revision_requested";
  const isApproved = deliverable.status === "approved";
  const canRequestRevision = isReadyForClientReview && deliverable.revisionsRemaining > 0;
  const canApprove = isReadyForClientReview;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{deliverable.type}</p>
            <h3 className="mt-1 font-semibold">{deliverable.title}</h3>
          </div>
          <Badge tone={statusTone[deliverable.status]}>{deliverable.status.replaceAll("_", " ")}</Badge>
        </div>
        <dl className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div>
            <dt className="font-medium text-foreground">Expected delivery</dt>
            <dd>{formatDate(deliverable.expectedDeliveryDate)}</dd>
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
        <div className="grid grid-cols-[repeat(2,max-content)_1fr] gap-2">
          {deliverable.externalUrl ? (
            <ButtonLink href={deliverable.externalUrl} variant="outline" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 size-4" />
              Open link
            </ButtonLink>
          ) : null}
          {mode === "admin" && projectId ? (
            <details className="contents">
              <summary className="inline-flex h-10 cursor-pointer list-none items-center justify-center rounded-md border border-sky-200 bg-sky-50 px-3 text-sm font-medium text-sky-800 transition-colors hover:bg-sky-100 marker:hidden">
                <Pencil className="mr-2 size-4" />
                Edit link
              </summary>
              <form action={updateDeliverableLink} className="col-span-full grid w-full gap-2 rounded-md border bg-muted/30 p-3 sm:grid-cols-[1fr_auto]">
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
        </div>
        {isRevisionPending ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Revision pending. The team needs to resubmit this deliverable before the client can approve or request another revision.
          </div>
        ) : null}
        {mode === "client" && projectId ? (
          <div className="grid gap-3 border-t pt-4">
            <form action={approveDeliverable}>
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="deliverableId" value={deliverable.id} />
              <Button type="submit" variant="outline" disabled={!canApprove || deliverable.status === "approved"}>
                Approve deliverable
              </Button>
            </form>
            <form action={requestDeliverableRevision} className="space-y-2">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="deliverableId" value={deliverable.id} />
              <textarea
                name="body"
                required
                rows={3}
                placeholder="Describe the requested revision"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                disabled={!canRequestRevision}
              />
              <Button type="submit" variant="secondary" disabled={!canRequestRevision}>
                Request revision
              </Button>
            </form>
          </div>
        ) : null}
        {mode === "admin" && projectId ? (
          <div className="grid gap-3 border-t pt-4">
            <h4 className="text-sm font-medium">Admin actions</h4>
            {isApproved ? (
              <form action={undoDeliverableApproval} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="deliverableId" value={deliverable.id} />
                <Button type="button" variant="success" disabled>
                  <Check className="mr-2 size-4" />
                  Approved
                </Button>
                <Button type="submit" variant="outline">Undo approval</Button>
              </form>
            ) : (
              <details>
                <summary className="inline-flex h-10 cursor-pointer list-none items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100 marker:hidden">
                  Mark approved
                </summary>
                <form action={approveDeliverableOnBehalf} className="mt-3 grid gap-3 rounded-md border bg-muted/30 p-3 md:grid-cols-[160px_1fr_auto]">
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
              <details>
                <summary className="inline-flex h-10 cursor-pointer list-none items-center justify-center rounded-md border border-amber-200 bg-amber-50 px-4 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100 marker:hidden">
                  Log manual revision
                </summary>
                <form action={logManualRevision} className="mt-3 grid gap-3 rounded-md border bg-muted/30 p-3 md:grid-cols-[160px_1fr_auto]">
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
          <div className="space-y-2 border-t pt-4">
            <h4 className="text-sm font-medium">Comments</h4>
            {deliverable.comments.map((comment) => (
              <div key={comment.id} className="rounded-md bg-muted p-3 text-sm">
                <p className="text-muted-foreground">{comment.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {comment.authorName ?? "User"} - {formatDate(comment.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

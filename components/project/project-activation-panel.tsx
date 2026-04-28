import { activateProject, confirmPayment, syncClientPortalAccess, updateDealStatus } from "@/features/projects/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Project } from "@/types/domain";

export function ProjectActivationPanel({ project }: { project: Project }) {
  const proposalApproved = project.preActivationStatus === "proposal_approved" || project.activationState === "proposal_approved";
  const paymentConfirmed = project.activationState === "payment_confirmed" || project.status === "payment_confirmed";
  const canActivate = paymentConfirmed;
  const isActive = project.activationState === "activated";
  const isSuspended = project.status === "paused" || project.status === "archived";
  const proposalLocked = paymentConfirmed || isActive || isSuspended || project.status === "complete";
  const primaryStatus = isActive ? "Portal active" : paymentConfirmed ? "Payment confirmed" : proposalApproved ? "Proposal approved" : "In proposal";
  const proposalStatusValue = ["draft", "proposal_sent", "proposal_approved"].includes(project.preActivationStatus ?? "")
    ? project.preActivationStatus
    : proposalApproved
      ? "proposal_approved"
      : "draft";

  if (isActive) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Activation flow</h2>
            <p className="mt-1 text-sm text-muted-foreground">Move from proposal approval to payment confirmation, then open the portal.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={isActive ? "active" : paymentConfirmed || proposalApproved ? "waiting" : "neutral"}>{primaryStatus}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid items-stretch gap-4 lg:grid-cols-4">
        <form action={updateDealStatus} className="flex h-full flex-col gap-3">
          <input type="hidden" name="projectId" value={project.id} />
          <label className="space-y-2">
            <span className="text-sm font-medium">Proposal status</span>
            <select
              name="status"
              defaultValue={proposalStatusValue}
              disabled={proposalLocked}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="draft">Draft</option>
              <option value="proposal_sent">Proposal sent</option>
              <option value="proposal_approved">Proposal approved</option>
            </select>
          </label>
          <Button type="submit" variant="outline" disabled={proposalLocked} className="mt-auto w-fit">Update proposal</Button>
        </form>
        <form action={confirmPayment} className="flex h-full flex-col gap-3">
          <input type="hidden" name="projectId" value={project.id} />
          <p className="text-sm text-muted-foreground">Use this after the proposal is approved and payment or deposit is confirmed outside the app.</p>
          <Button type="submit" variant="outline" disabled={!proposalApproved || paymentConfirmed || isActive || isSuspended} className="mt-auto w-fit">Confirm payment</Button>
        </form>
        <form action={activateProject} className="flex h-full flex-col gap-3">
          <input type="hidden" name="projectId" value={project.id} />
          <p className="text-sm text-muted-foreground">Activation makes the project visible in the client portal.</p>
          <Button type="submit" disabled={!canActivate || isActive || isSuspended} className="mt-auto w-fit">Activate portal</Button>
        </form>
        <form action={syncClientPortalAccess} className="flex h-full flex-col gap-3">
          <input type="hidden" name="projectId" value={project.id} />
          <p className="text-sm text-muted-foreground">Creates or repairs the primary client contact portal membership.</p>
          <Button type="submit" variant="outline" disabled={!isActive || isSuspended} className="mt-auto w-fit">Sync client access</Button>
        </form>
      </CardContent>
    </Card>
  );
}

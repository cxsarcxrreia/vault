import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { AppWorkspace, WorkspaceHeader, SectionBlock } from "@/components/layout/app-workspace";
import { PlanCard } from "@/components/plans/plan-card";
import { FormMessage } from "@/components/shared/form-message";
import { SetupRequired } from "@/components/shared/setup-required";
import { Button, ButtonLink } from "@/components/ui/button";
import { applyManualPlanChange } from "@/features/plans/actions";
import {
  PLAN_DEFINITIONS,
  PLAN_ORDER,
  PROJECT_LIMIT_COUNT_DESCRIPTION,
  type PlanTier
} from "@/features/plans/constants";
import { getCurrentOrganizationPlanUsage } from "@/features/plans/queries";

type BillingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getPlanRank(tier: PlanTier) {
  return PLAN_ORDER.indexOf(tier);
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = typeof params.error === "string" ? params.error : null;
  const updated = typeof params.updated === "string" ? params.updated : null;
  const usageResult = await getCurrentOrganizationPlanUsage();
  const usage = usageResult.data;

  return (
    <AppWorkspace width="wide">
      <WorkspaceHeader
        label="Admin"
        title="Billing and plan"
        meta="Plan capacity and temporary manual upgrade controls."
        actions={<ButtonLink href="/pricing" variant="outline">Public pricing</ButtonLink>}
      />
      <div className="space-y-6">
        {error ? <FormMessage type="error">{error}</FormMessage> : null}
        {updated ? <FormMessage type="success">Plan marked as {PLAN_DEFINITIONS[updated as PlanTier]?.name ?? "updated"} manually.</FormMessage> : null}
        {usageResult.setupRequired ? <SetupRequired message={usageResult.error} /> : null}
        {usageResult.error && !usageResult.setupRequired ? <FormMessage type="warning">{usageResult.error}</FormMessage> : null}

        {usage ? (
          <>
            <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <p className="text-sm font-medium text-muted-foreground">Current plan</p>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-semibold tracking-normal">{usage.planName}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Subscription status: <span className="font-medium text-foreground">{usage.subscriptionStatus.replaceAll("_", " ")}</span>
                    </p>
                  </div>
                  <div className="rounded-md border bg-muted px-3 py-2 text-sm font-medium">{usage.usageLabel}</div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{PROJECT_LIMIT_COUNT_DESCRIPTION}</p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <p className="text-sm font-medium text-muted-foreground">Project capacity</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-normal">
                  {usage.isLimitReached ? "Limit reached" : "Capacity available"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {usage.isLimitReached
                    ? "Create another project after archiving an old project or moving to a higher plan."
                    : "New draft projects can still be created under the current plan."}
                </p>
                {usage.isLimitReached ? (
                  <div className="mt-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>The creation limit is enforced server-side before any client or project record is created.</span>
                  </div>
                ) : null}
              </div>
            </section>

            <SectionBlock title="Available plans" description="Manual changes are temporary placeholders until real checkout and webhooks are added.">
              <div className="grid gap-4 md:grid-cols-3">
                {PLAN_ORDER.map((tier) => {
                  const plan = PLAN_DEFINITIONS[tier];
                  const isCurrent = usage.planTier === tier;
                  const isUpgrade = getPlanRank(tier) > getPlanRank(usage.planTier);

                  return (
                    <PlanCard
                      key={plan.tier}
                      plan={plan}
                      isCurrent={isCurrent}
                      action={
                        isCurrent ? (
                          <Button className="w-full" variant="secondary" disabled>
                            Current plan
                          </Button>
                        ) : isUpgrade && usage.canManagePlan ? (
                          <form action={applyManualPlanChange} className="w-full">
                            <input type="hidden" name="planTier" value={plan.tier} />
                            <Button type="submit" className="w-full" variant={plan.isPopular ? "primary" : "outline"}>
                              {plan.ctaLabel}
                              <ArrowUpRight className="ml-2 size-4" aria-hidden="true" />
                            </Button>
                          </form>
                        ) : (
                          <Button className="w-full" variant="outline" disabled>
                            {usage.canManagePlan ? "Not available" : "Admin only"}
                          </Button>
                        )
                      }
                      footer={
                        isUpgrade
                          ? "This marks the plan manually in the database; it is not payment processing."
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </SectionBlock>
          </>
        ) : null}
      </div>
    </AppWorkspace>
  );
}

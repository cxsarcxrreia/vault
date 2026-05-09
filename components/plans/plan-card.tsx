import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PlanDefinition } from "@/features/plans/constants";

export function PlanCard({
  plan,
  action,
  footer,
  isCurrent = false
}: {
  plan: PlanDefinition;
  action: React.ReactNode;
  footer?: React.ReactNode;
  isCurrent?: boolean;
}) {
  return (
    <section
      className={cn(
        "group relative flex h-full flex-col rounded-lg border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-foreground/25 hover:shadow-md",
        plan.isPopular ? "border-foreground/35 shadow-md" : "border-border",
        isCurrent ? "ring-2 ring-foreground/10" : null
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{plan.name}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.shortDescription}</p>
        </div>
        {plan.isPopular ? (
          <span className="shrink-0 rounded-md border bg-muted px-2 py-1 text-xs font-medium text-foreground">
            Most popular
          </span>
        ) : null}
      </div>

      <div className="mt-6">
        <p className="text-3xl font-semibold tracking-normal">{plan.priceLabel}</p>
        <p className="mt-2 text-sm text-muted-foreground">{plan.projectLimitLabel}</p>
      </div>

      <div className="mt-6 space-y-3 text-sm">
        {[
          "Organization-scoped client projects",
          "Deliverables, revisions, and approvals",
          "External document and asset links"
        ].map((item) => (
          <div key={item} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-1 items-end">{action}</div>
      {footer ? <div className="mt-4 text-xs leading-5 text-muted-foreground">{footer}</div> : null}
    </section>
  );
}

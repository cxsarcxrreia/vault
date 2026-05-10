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
        "group relative flex h-full flex-col rounded-2xl border bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300",
        plan.isPopular ? "border-neutral-300 bg-neutral-50/60" : "border-neutral-200",
        isCurrent ? "ring-2 ring-foreground/10" : null
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-neutral-900">{plan.name}</h2>
          <p className="mt-2 text-[13px] leading-5 text-neutral-500">{plan.shortDescription}</p>
        </div>
        {plan.isPopular ? (
          <span className="shrink-0 rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-600">
            Most popular
          </span>
        ) : null}
      </div>

      <div className="mt-6">
        <p className="text-[28px] font-semibold tracking-normal text-neutral-900">{plan.priceLabel}</p>
        <p className="mt-2 text-[13px] text-neutral-500">{plan.projectLimitLabel}</p>
      </div>

      <div className="mt-6 space-y-3 text-[13px] text-neutral-700">
        {[
          "Organization-scoped client projects",
          "Deliverables, revisions, and approvals",
          "External document and asset links"
        ].map((item) => (
          <div key={item} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-neutral-400" aria-hidden="true" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-1 items-end">{action}</div>
      {footer ? <div className="mt-4 text-[12px] leading-5 text-neutral-500">{footer}</div> : null}
    </section>
  );
}

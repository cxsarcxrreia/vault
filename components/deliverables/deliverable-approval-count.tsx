import type { Deliverable } from "@/types/domain";

export function DeliverableApprovalCount({ deliverables }: { deliverables: Deliverable[] }) {
  const totalCount = deliverables.length;
  const approvedCount = deliverables.filter((deliverable) => deliverable.status === "approved").length;
  const label = `${approvedCount} out of ${totalCount} deliverables approved`;

  return (
    <span className="group relative inline-flex items-center">
      <span
        aria-label={label}
        title={label}
        className="inline-flex h-6 items-center rounded-full border bg-muted px-2 text-xs font-medium text-muted-foreground"
      >
        {approvedCount}/{totalCount}
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs font-normal text-popover-foreground shadow-sm group-hover:block">
        {label}
      </span>
    </span>
  );
}

import { DeliverableCard } from "@/components/deliverables/deliverable-card";
import type { Deliverable } from "@/types/domain";

export function DeliverablesList({
  deliverables,
  projectId,
  mode = "readonly"
}: {
  deliverables: Deliverable[];
  projectId?: string;
  mode?: "admin" | "client" | "readonly";
}) {
  if (!deliverables.length) {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        No deliverables yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {deliverables.map((deliverable) => (
        <DeliverableCard key={deliverable.id} deliverable={deliverable} projectId={projectId} mode={mode} />
      ))}
    </div>
  );
}

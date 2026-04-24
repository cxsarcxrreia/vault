import { Plus } from "lucide-react";
import { createResponsibilityItem, deleteResponsibilityItem, updateResponsibilityItem } from "@/features/projects/actions";
import { getResponsibilityOwnerLabel, RESPONSIBILITY_OWNERS } from "@/features/projects/responsibilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ResponsibilityItem, ResponsibilityOwner } from "@/types/domain";

const ownerTone: Record<ResponsibilityOwner, "review" | "waiting" | "active" | "neutral"> = {
  agency: "review",
  client: "waiting",
  external: "neutral",
  shared: "active"
};

const editableGridClass = "md:grid-cols-[1.2fr_0.7fr_minmax(12rem,0.9fr)_auto]";
const readonlyGridClass = "md:grid-cols-[1.2fr_0.7fr_1.4fr]";

type ResponsibilityListProps = {
  items: ResponsibilityItem[];
  mode?: "readonly" | "admin";
  projectId?: string;
  presets?: string[];
};

function OwnerSelect({ defaultValue }: { defaultValue?: ResponsibilityOwner }) {
  return (
    <select
      name="owner"
      defaultValue={defaultValue ?? "agency"}
      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
    >
      {RESPONSIBILITY_OWNERS.map((owner) => (
        <option key={owner.value} value={owner.value}>
          {owner.label}
        </option>
      ))}
    </select>
  );
}

export function ResponsibilityList({ items, mode = "readonly", projectId, presets = [] }: ResponsibilityListProps) {
  const canEdit = mode === "admin" && Boolean(projectId);
  const responsibilityPresets = presets.length ? presets : ["Content Planning", "Creative Direction", "Feedback and Approvals"];

  return (
    <Card>
      <CardContent className="space-y-4">
        <div
          className={
            canEdit
              ? `grid gap-2 text-xs font-medium uppercase text-muted-foreground ${editableGridClass}`
              : `grid gap-2 px-4 text-xs font-medium uppercase text-muted-foreground ${readonlyGridClass}`
          }
        >
          <span>Responsibility</span>
          <span>Owner</span>
          <span>Notes</span>
          {canEdit ? <span className="sr-only">Actions</span> : null}
        </div>

        {items.length ? (
          <div className="space-y-3">
            {items.map((item) =>
              canEdit ? (
                <div key={item.id} className={`grid gap-3 rounded-lg border bg-background p-3 md:items-end ${editableGridClass}`}>
                  <form id={`responsibility-${item.id}`} action={updateResponsibilityItem} className="contents">
                    <input type="hidden" name="projectId" value={projectId} form={`responsibility-${item.id}`} />
                    <input type="hidden" name="responsibilityId" value={item.id} form={`responsibility-${item.id}`} />
                  </form>
                  <label className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground md:hidden">Responsibility</span>
                    <input
                      name="title"
                      form={`responsibility-${item.id}`}
                      defaultValue={item.title}
                      required
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground md:hidden">Owner</span>
                    <select
                      name="owner"
                      form={`responsibility-${item.id}`}
                      defaultValue={item.owner}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      {RESPONSIBILITY_OWNERS.map((owner) => (
                        <option key={owner.value} value={owner.value}>
                          {owner.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground md:hidden">Notes</span>
                    <input
                      name="notes"
                      form={`responsibility-${item.id}`}
                      defaultValue={item.notes ?? ""}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
                    <Button type="submit" variant="outline" form={`responsibility-${item.id}`} className="h-10 px-4">
                      Save
                    </Button>
                    <form action={deleteResponsibilityItem}>
                      <input type="hidden" name="projectId" value={projectId} />
                      <input type="hidden" name="responsibilityId" value={item.id} />
                      <Button type="submit" variant="danger" className="h-10 px-4">Delete</Button>
                    </form>
                  </div>
                </div>
              ) : (
                <div key={item.id} className={`grid gap-3 rounded-lg border bg-background p-4 md:items-start ${readonlyGridClass}`}>
                  <p className="text-sm font-medium">{item.title}</p>
                  <Badge tone={ownerTone[item.owner]} className="w-fit self-start">
                    {getResponsibilityOwnerLabel(item.owner)}
                  </Badge>
                  <p className="self-start text-sm text-muted-foreground">{item.notes || "No notes yet."}</p>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
            No responsibility rows have been added yet.
          </div>
        )}

        {canEdit ? (
          <details className="group rounded-xl border border-dashed bg-background transition-colors open:border-solid open:bg-card">
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-4 py-4 transition-colors hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground transition-colors group-open:bg-primary group-open:text-primary-foreground">
                <Plus className="size-4 transition-transform group-open:rotate-45" aria-hidden="true" />
              </span>
              <span className="font-semibold">Add responsibility</span>
            </summary>
            <form action={createResponsibilityItem} className="grid gap-3 border-t p-4 md:grid-cols-[1.2fr_0.7fr_1.4fr_auto] md:items-end">
              <input type="hidden" name="projectId" value={projectId} />
              <label className="space-y-2">
                <span className="text-sm font-medium">Responsibility</span>
                <select name="title" required className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  {responsibilityPresets.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Owner</span>
                <OwnerSelect />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Notes</span>
                <input name="notes" placeholder="Optional context" className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
              </label>
              <Button type="submit">Add</Button>
            </form>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

"use client";

import { useMemo, useState } from "react";
import { deleteResponsibilityItem, updateResponsibilityItem } from "@/features/projects/actions";
import { ConfirmSubmitButton } from "@/components/shared/confirm-submit-button";
import { RESPONSIBILITY_OWNERS } from "@/features/projects/responsibilities";
import { Button } from "@/components/ui/button";
import type { ResponsibilityItem } from "@/types/domain";

type EditableResponsibilityRowProps = {
  item: ResponsibilityItem;
  projectId: string;
  gridClassName: string;
};

export function EditableResponsibilityRow({ item, projectId, gridClassName }: EditableResponsibilityRowProps) {
  const [title, setTitle] = useState(item.title);
  const [owner, setOwner] = useState(item.owner);
  const [notes, setNotes] = useState(item.notes ?? "");

  const isDirty = useMemo(
    () => title !== item.title || owner !== item.owner || notes !== (item.notes ?? ""),
    [item.notes, item.owner, item.title, notes, owner, title]
  );

  return (
    <div className={`grid gap-3 rounded-lg border bg-background p-3 md:items-end ${gridClassName}`}>
      <form id={`responsibility-${item.id}`} action={updateResponsibilityItem} className="contents">
        <input type="hidden" name="projectId" value={projectId} form={`responsibility-${item.id}`} />
        <input type="hidden" name="responsibilityId" value={item.id} form={`responsibility-${item.id}`} />
      </form>
      <label className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground md:hidden">Responsibility</span>
        <input
          name="title"
          form={`responsibility-${item.id}`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        />
      </label>
      <label className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground md:hidden">Owner</span>
        <select
          name="owner"
          form={`responsibility-${item.id}`}
          value={owner}
          onChange={(event) => setOwner(event.target.value as ResponsibilityItem["owner"])}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          {RESPONSIBILITY_OWNERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground md:hidden">Notes</span>
        <input
          name="notes"
          form={`responsibility-${item.id}`}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
        {isDirty ? (
          <Button type="submit" variant="outline" form={`responsibility-${item.id}`} className="h-10 px-4">
            Save
          </Button>
        ) : null}
        <form action={deleteResponsibilityItem}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="responsibilityId" value={item.id} />
          <ConfirmSubmitButton
            triggerLabel="Delete"
            title="Delete responsibility?"
            description="This permanently removes this responsibility item from the project. This action cannot be undone."
            confirmLabel="Delete"
            triggerVariant="danger"
            confirmVariant="danger"
            className="h-10 px-4"
          />
        </form>
      </div>
    </div>
  );
}

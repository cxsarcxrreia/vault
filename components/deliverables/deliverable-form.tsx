import { Plus } from "lucide-react";
import { createDeliverable } from "@/features/projects/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DeliverableForm({ projectId }: { projectId: string }) {
  return (
    <details className="group rounded-xl border border-dashed bg-background transition-colors open:border-solid open:bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-4 py-4 transition-colors hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground transition-colors group-open:bg-primary group-open:text-primary-foreground">
          <Plus className="size-4 transition-transform group-open:rotate-45" aria-hidden="true" />
        </span>
        <span className="font-semibold">Create deliverable</span>
      </summary>
      <Card className="border-x-0 border-b-0 shadow-none">
        <CardHeader>
          <h2 className="font-semibold">Create deliverable</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use Google Drive or an external asset link for review files.</p>
        </CardHeader>
        <CardContent>
          <form action={createDeliverable} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="projectId" value={projectId} />
            <label className="space-y-2">
              <span className="text-sm font-medium">Title</span>
              <input name="title" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Type</span>
              <input name="deliverableType" required placeholder="Reels, Photos, Brand book" className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Expected delivery</span>
              <input name="expectedDeliveryDate" type="date" className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Delivery state</span>
              <select name="deliveryState" defaultValue="planned" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="planned">Not started</option>
                <option value="in_progress">In production</option>
                <option value="editing">Editing</option>
              </select>
              <span className="block text-xs text-muted-foreground">Used only when no file link is attached.</span>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Revision limit</span>
              <input name="revisionLimit" type="number" min="0" max="20" defaultValue="2" className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium">Google Drive or external link</span>
              <input name="externalUrl" type="url" placeholder="https://drive.google.com/..." className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium">Internal notes</span>
              <textarea name="internalNotes" rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </label>
            <div className="md:col-span-2">
              <Button type="submit">Add deliverable</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </details>
  );
}

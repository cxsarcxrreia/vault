import { createDeliverable } from "@/features/projects/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DeliverableForm({ projectId }: { projectId: string }) {
  return (
    <Card>
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
  );
}

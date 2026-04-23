import { createDraftProject } from "@/features/projects/actions";
import type { ProjectTemplate } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DraftProjectForm({ templates }: { templates: ProjectTemplate[] }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">Create draft project</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Drafts stay internal until payment is confirmed and the team activates the portal.
        </p>
      </CardHeader>
      <CardContent>
        <form action={createDraftProject} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Project name</span>
            <input name="projectName" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Client name</span>
            <input name="clientName" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Client email</span>
            <input name="clientEmail" type="email" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Template</span>
            <select name="templateId" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              <option value="">Custom / undecided</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Service type</span>
            <input name="serviceType" className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium">Starts on</span>
              <input name="startsOn" type="date" className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Ends on</span>
              <input name="endsOn" type="date" className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
          </div>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Summary</span>
            <textarea name="summary" rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </label>
          <div className="md:col-span-2">
            <Button type="submit">Create draft</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

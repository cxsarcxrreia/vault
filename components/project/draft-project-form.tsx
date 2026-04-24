import { Plus } from "lucide-react";
import { createDraftProject } from "@/features/projects/actions";
import { RESPONSIBILITY_OWNERS, RESPONSIBILITY_STARTER_ROWS } from "@/features/projects/responsibilities";
import type { ProjectTemplate } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DraftProjectForm({ templates }: { templates: ProjectTemplate[] }) {
  return (
    <details className="group rounded-xl border border-dashed bg-background transition-colors open:border-solid open:bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-4 py-4 transition-colors hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground transition-colors group-open:bg-primary group-open:text-primary-foreground">
          <Plus className="size-4 transition-transform group-open:rotate-45" aria-hidden="true" />
        </span>
        <span className="font-semibold">Create draft project</span>
      </summary>
      <Card className="border-x-0 border-b-0 shadow-none">
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
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4 md:col-span-2">
              <label className="flex items-start gap-3">
                <input name="includeResponsibilities" value="1" type="checkbox" className="mt-1 size-4 rounded border" />
                <span>
                  <span className="block text-sm font-medium">Add starter responsibility matrix now</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Use this if responsibilities are already clear after onboarding. Otherwise leave it unchecked and complete it later.
                  </span>
                </span>
              </label>
              <details className="group rounded-md border bg-background">
                <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  Customize starter rows
                </summary>
                <div className="space-y-3 border-t p-3">
                  {RESPONSIBILITY_STARTER_ROWS.map((row, index) => (
                    <div key={`${row.title}-${index}`} className="grid gap-3 rounded-md border p-3 md:grid-cols-[1.4fr_0.8fr_1.6fr]">
                      <label className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Responsibility</span>
                        <input
                          name="responsibilityTitle"
                          defaultValue={row.title}
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Owner</span>
                        <select
                          name="responsibilityOwner"
                          defaultValue={row.owner}
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
                        <span className="text-xs font-medium text-muted-foreground">Notes</span>
                        <input
                          name="responsibilityNotes"
                          defaultValue={row.notes}
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </details>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Create draft</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </details>
  );
}

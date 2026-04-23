import { archiveProject, pauseProject, restoreProject, resumeProject } from "@/features/projects/actions";
import { formatArchiveReason, getMainProjectState } from "@/features/projects/state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import type { Project } from "@/types/domain";

export function ProjectStatePanel({ project }: { project: Project }) {
  const mainState = getMainProjectState(project);
  const isActive = mainState === "Active";
  const isPaused = mainState === "Paused";
  const isArchived = mainState === "Archived";
  const archiveReason = formatArchiveReason(project.archiveReason);

  return (
    <details className="rounded-lg border bg-card shadow-sm">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4 marker:hidden">
        <div>
          <h2 className="font-semibold">Project state</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pause active work or archive projects that should leave operations.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={isActive ? "active" : isPaused ? "waiting" : "neutral"}>{mainState}</Badge>
          {archiveReason ? <Badge>{archiveReason}</Badge> : null}
        </div>
      </summary>
      <CardContent className="grid gap-4 border-t lg:grid-cols-3">
        <form action={isPaused ? resumeProject : pauseProject} className="space-y-3">
          <input type="hidden" name="projectId" value={project.id} />
          <p className="text-sm text-muted-foreground">
            Paused projects stay visible, but workflow actions are treated as suspended until resumed.
          </p>
          <Button type="submit" variant="outline" disabled={!isActive && !isPaused}>
            {isPaused ? "Resume project" : "Pause project"}
          </Button>
        </form>
        {isArchived ? (
          <form action={restoreProject} className="space-y-3">
            <input type="hidden" name="projectId" value={project.id} />
            <p className="text-sm text-muted-foreground">Restore the project to operational use.</p>
            <Button type="submit" variant="outline">Restore project</Button>
          </form>
        ) : (
          <form action={archiveProject} className="space-y-3">
            <input type="hidden" name="projectId" value={project.id} />
            <label className="space-y-2">
              <span className="text-sm font-medium">Archive reason</span>
              <select name="archiveReason" defaultValue="completed" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="duplicate">Duplicate</option>
                <option value="expired">Expired</option>
              </select>
            </label>
            <Button type="submit" variant="outline">Archive project</Button>
          </form>
        )}
        <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
          Archived projects block new workflow actions. Completed archives can remain readable for clients; cancelled, duplicate, and expired archives are internal history.
        </div>
      </CardContent>
    </details>
  );
}

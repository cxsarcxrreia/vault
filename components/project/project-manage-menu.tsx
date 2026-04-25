import { SlidersHorizontal } from "lucide-react";
import { archiveProject, pauseProject, restoreProject, resumeProject } from "@/features/projects/actions";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/domain";

export function ProjectManageMenu({ project }: { project: Project }) {
  const isArchived = project.status === "archived";
  const isPaused = project.status === "paused";
  const canComplete = project.status === "active" || project.status === "paused" || project.status === "complete";
  const canArchive = !isArchived;

  return (
    <details className="group relative">
      <summary className="list-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Manage Project
        </span>
      </summary>
      <div className="absolute right-0 top-full z-20 mt-2 w-[18rem] rounded-lg border bg-card p-4 shadow-lg">
        <div className="space-y-4">
          {canComplete ? (
            <form action={archiveProject} className="space-y-2">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="archiveReason" value="completed" />
              <p className="text-sm text-muted-foreground">Complete the project and archive it as finished.</p>
              <Button type="submit" variant="outline" className="w-full justify-center">
                Complete project
              </Button>
            </form>
          ) : null}

          {!isArchived ? (
            <form action={isPaused ? resumeProject : pauseProject} className="space-y-2">
              <input type="hidden" name="projectId" value={project.id} />
              <p className="text-sm text-muted-foreground">
                {isPaused
                  ? "Resume this project and return it to active operations."
                  : "Pause this project while keeping it visible in the system."}
              </p>
              <Button type="submit" variant="outline" className="w-full justify-center">
                {isPaused ? "Resume project" : "Pause project"}
              </Button>
            </form>
          ) : null}

          {isArchived ? (
            <form action={restoreProject} className="space-y-2 border-t pt-4">
              <input type="hidden" name="projectId" value={project.id} />
              <p className="text-sm text-muted-foreground">Restore this archived project to operational use.</p>
              <Button type="submit" variant="outline" className="w-full justify-center">
                Restore project
              </Button>
            </form>
          ) : null}

          {canArchive ? (
            <form action={archiveProject} className="space-y-2 border-t pt-4">
              <input type="hidden" name="projectId" value={project.id} />
              <label className="space-y-2">
                <span className="text-sm font-medium">Archive reason</span>
                <select name="archiveReason" defaultValue="cancelled" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="cancelled">Cancelled</option>
                  <option value="duplicate">Duplicate</option>
                  <option value="expired">Expired</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <Button type="submit" variant="outline" className="w-full justify-center">
                Archive project
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </details>
  );
}

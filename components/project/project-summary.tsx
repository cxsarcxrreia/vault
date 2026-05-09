import { CalendarDays } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatArchiveReason, getMainProjectState, getProjectStateTone } from "@/features/projects/state";
import { formatDate } from "@/lib/utils/format";
import type { Project } from "@/types/domain";

export function ProjectSummary({ project, actions }: { project: Project; actions?: ReactNode }) {
  const mainState = getMainProjectState(project);
  const archiveReason = formatArchiveReason(project.archiveReason);

  return (
    <Card className="rounded-2xl border-neutral-200 shadow-none">
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-medium leading-none text-neutral-900/45">{project.clientName}</p>
            <h2 className="mt-1.5 text-xl font-semibold text-neutral-900">{project.name}</h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap justify-end gap-2">
              <Badge tone={getProjectStateTone(project.status)}>{mainState}</Badge>
              {archiveReason ? <Badge>{archiveReason}</Badge> : null}
            </div>
            {actions}
          </div>
        </div>
        <p className="text-[13px] leading-5 text-neutral-500">{project.summary}</p>
        <div className="flex flex-wrap gap-4 text-[13px] text-neutral-500">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4" />
            {formatDate(project.startsOn)} to {formatDate(project.endsOn)}
          </span>
          <span>Current phase: {project.currentPhase}</span>
          <span>Template: {project.templateName}</span>
        </div>
      </CardContent>
    </Card>
  );
}

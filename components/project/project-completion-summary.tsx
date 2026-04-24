import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMainProjectState, getProjectStateTone } from "@/features/projects/state";
import type { Project } from "@/types/domain";

export function ProjectCompletionSummary({ project }: { project: Project }) {
  const completedDeliverables = project.deliverables.filter((deliverable) =>
    ["approved", "delivered"].includes(deliverable.status)
  ).length;
  const clientVisibleDocuments = project.documents.filter((document) => document.visibleToClient).length;

  return (
    <Card>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">Project state</p>
          <Badge tone={getProjectStateTone(project.status)}>{getMainProjectState(project)}</Badge>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase text-muted-foreground">Approved deliverables</p>
          <p className="text-sm font-semibold">
            {completedDeliverables} of {project.deliverables.length}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase text-muted-foreground">Client visible documents</p>
          <p className="text-sm font-semibold">{clientVisibleDocuments}</p>
        </div>
      </CardContent>
    </Card>
  );
}

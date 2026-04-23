import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusDot } from "@/components/shared/status-dot";
import { completeProjectPhase, startProjectPhase } from "@/features/projects/actions";
import type { ProjectPhase } from "@/types/domain";

type MacroTimelineProps = {
  phases: ProjectPhase[];
  projectId?: string;
  mode?: "readonly" | "admin";
};

export function MacroTimeline({ phases, projectId, mode = "readonly" }: MacroTimelineProps) {
  const canManage = mode === "admin" && Boolean(projectId);

  return (
    <Card>
      <CardContent>
        <ol className="grid gap-3 md:grid-cols-3">
          {phases
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((phase) => (
              <li key={phase.id} className="rounded-md border p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <StatusDot tone={phase.status === "active" ? "active" : phase.status === "complete" ? "review" : "neutral"} />
                      <span className="text-sm font-medium">{phase.name}</span>
                    </div>
                    <Badge tone={phase.status === "active" ? "active" : "neutral"}>{phase.status}</Badge>
                  </div>
                  {canManage ? (
                    <div className="flex flex-wrap gap-2 border-t pt-3">
                      {phase.status === "active" ? (
                        <form action={completeProjectPhase}>
                          <input type="hidden" name="projectId" value={projectId} />
                          <input type="hidden" name="phaseId" value={phase.id} />
                          <Button variant="success" className="h-8 px-3 text-xs">
                            Complete
                          </Button>
                        </form>
                      ) : (
                        <form action={startProjectPhase}>
                          <input type="hidden" name="projectId" value={projectId} />
                          <input type="hidden" name="phaseId" value={phase.id} />
                          <Button variant="outline" className="h-8 px-3 text-xs">
                            Set active
                          </Button>
                        </form>
                      )}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
        </ol>
      </CardContent>
    </Card>
  );
}

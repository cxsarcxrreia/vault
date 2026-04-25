import Link from "next/link";
import { Check, Circle, CircleDot, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusDot } from "@/components/shared/status-dot";
import { getDocumentPhaseKeyForTimelinePhase } from "@/features/documents/phases";
import { completeProjectPhase, startProjectPhase } from "@/features/projects/actions";
import { cn } from "@/lib/utils/cn";
import type { DocumentPhaseKey, PhaseStatus, Project, ProjectPhase } from "@/types/domain";

export type MacroTimelineDisplayMode = "nodes" | "cards";

type MacroTimelineProps = {
  phases: ProjectPhase[];
  projectId?: string;
  basePath?: string;
  displayMode?: MacroTimelineDisplayMode;
  isProjectPaused?: boolean;
  mode?: "readonly" | "admin";
  selectedPhaseKey?: DocumentPhaseKey | null;
};

type PhaseVisualStatus = PhaseStatus | "paused";

const statusTone: Record<PhaseVisualStatus, "neutral" | "active" | "review" | "waiting"> = {
  not_started: "neutral",
  active: "active",
  complete: "review",
  paused: "waiting"
};

const nodeClasses: Record<PhaseVisualStatus, string> = {
  not_started: "border-border bg-background text-muted-foreground",
  active: "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm ring-4 ring-emerald-100",
  complete: "border-sky-300 bg-sky-50 text-sky-800 shadow-sm ring-4 ring-sky-100",
  paused: "border-amber-300 bg-amber-50 text-amber-900 shadow-sm ring-4 ring-amber-100"
};

const cardClasses: Record<PhaseVisualStatus, string> = {
  not_started: "bg-background",
  active: "border-emerald-300 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-100",
  complete: "border-sky-200 bg-sky-50/70 shadow-sm",
  paused: "border-amber-300 bg-amber-50/75 shadow-sm ring-1 ring-amber-100"
};

function getVisualStatus(phase: ProjectPhase, isProjectPaused?: boolean): PhaseVisualStatus {
  if (phase.status === "active" && isProjectPaused) {
    return "paused";
  }

  return phase.status;
}

function normalizePhaseKey(phase: ProjectPhase) {
  return `${phase.phaseKey || phase.name}`
    .toLowerCase()
    .trim()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getTimelineHref({
  phase,
  basePath,
  displayMode
}: {
  phase: ProjectPhase;
  basePath: string | undefined;
  displayMode: MacroTimelineDisplayMode;
}) {
  const normalizedPhaseKey = normalizePhaseKey(phase);
  const params = new URLSearchParams();
  params.set("timeline", displayMode);

  if (normalizedPhaseKey === "deliverables") {
    return `${basePath ?? ""}?${params.toString()}#deliverables`;
  }

  if (normalizedPhaseKey === "project_complete") {
    return `${basePath ?? ""}?${params.toString()}#project-completion`;
  }

  const documentPhaseKey = getDocumentPhaseKeyForTimelinePhase(phase.phaseKey, phase.name);

  if (documentPhaseKey) {
    params.set("phase", documentPhaseKey);
    return `${basePath ?? ""}?${params.toString()}#documents`;
  }

  return `${basePath ?? ""}?${params.toString()}#documents`;
}

function PhaseStatusIcon({ status }: { status: PhaseVisualStatus }) {
  const className = "size-4";

  if (status === "complete") {
    return <Check className={className} aria-hidden="true" />;
  }

  if (status === "active") {
    return <CircleDot className={className} aria-hidden="true" />;
  }

  if (status === "paused") {
    return <Pause className={className} aria-hidden="true" />;
  }

  return <Circle className={className} aria-hidden="true" />;
}

function PhaseActions({ phase, projectId }: { phase: ProjectPhase; projectId?: string }) {
  if (!projectId) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {phase.status === "active" ? (
        <form action={completeProjectPhase}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="phaseId" value={phase.id} />
          <Button variant="outline" className="h-8 px-3 text-xs">
            Complete
          </Button>
        </form>
      ) : null}
      {phase.status !== "active" ? (
        <form action={startProjectPhase}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="phaseId" value={phase.id} />
          <Button variant="outline" className="h-8 px-3 text-xs">
            {phase.status === "complete" ? "Reopen" : "Set active"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export function MacroTimelineViewToggle({
  basePath,
  projectId,
  currentView,
  selectedPhaseKey
}: {
  basePath?: string;
  projectId: Project["id"];
  currentView: MacroTimelineDisplayMode;
  selectedPhaseKey?: DocumentPhaseKey | null;
}) {
  const hrefBase = basePath ?? `/admin/projects/${projectId}`;
  const views: Array<{ label: string; value: MacroTimelineDisplayMode }> = [
    { label: "Node view", value: "nodes" },
    { label: "Card view", value: "cards" }
  ];

  return (
    <div className="inline-flex rounded-md border bg-background p-1" aria-label="Timeline display mode">
      {views.map((view) => {
        const isActive = currentView === view.value;
        const params = new URLSearchParams();
        params.set("timeline", view.value);

        if (selectedPhaseKey) {
          params.set("phase", selectedPhaseKey);
        }

        return (
          <Link
            key={view.value}
            href={`${hrefBase}?${params.toString()}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {view.label}
          </Link>
        );
      })}
    </div>
  );
}

export function MacroTimeline({
  phases,
  projectId,
  basePath,
  displayMode = "cards",
  isProjectPaused,
  mode = "readonly",
  selectedPhaseKey = null
}: MacroTimelineProps) {
  const canManage = mode === "admin" && Boolean(projectId);
  const sortedPhases = phases.slice().sort((a, b) => a.position - b.position);

  if (displayMode === "nodes") {
    return (
      <Card>
        <CardContent>
          <ol className="space-y-6 md:flex md:items-start md:space-y-0">
            {sortedPhases.map((phase, index) => {
              const visualStatus = getVisualStatus(phase, isProjectPaused);
              const isLast = index === sortedPhases.length - 1;
              const relatedDocumentPhaseKey = getDocumentPhaseKeyForTimelinePhase(phase.phaseKey, phase.name);
              const isSelected = selectedPhaseKey && relatedDocumentPhaseKey === selectedPhaseKey;
              const href = getTimelineHref({ phase, basePath, displayMode });

              return (
                <li key={phase.id} className="relative flex gap-4 pb-2 md:block md:flex-1 md:px-2 md:pb-0">
                  {!isLast ? (
                    <>
                      <span
                        className={cn(
                          "absolute left-5 top-10 h-[calc(100%-1.5rem)] w-px md:hidden",
                          phase.status === "complete" ? "bg-sky-200" : "bg-border"
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={cn(
                          "absolute left-[calc(50%+1.25rem)] right-[calc(-50%+1.25rem)] top-5 hidden h-px md:block",
                          phase.status === "complete" ? "bg-sky-200" : "bg-border"
                        )}
                        aria-hidden="true"
                      />
                    </>
                  ) : null}
                  <div className="relative z-10 flex md:justify-center">
                    <Link
                      href={href}
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        nodeClasses[visualStatus],
                        isSelected ? "ring-4 ring-primary/20" : null
                      )}
                      aria-label={`${phase.name}: ${visualStatus.replaceAll("_", " ")}`}
                    >
                      <PhaseStatusIcon status={visualStatus} />
                    </Link>
                  </div>
                  <div className="min-w-0 space-y-3 md:mt-4 md:flex md:flex-col md:items-center md:text-center">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 md:flex-col md:items-center">
                      <Link href={href} className="inline-block rounded-sm text-sm font-semibold leading-5 hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        {phase.name}
                      </Link>
                      <Badge tone={statusTone[visualStatus]} className="w-fit md:self-center">
                        {visualStatus}
                      </Badge>
                    </div>
                    {canManage ? (
                      <div className="flex md:justify-center">
                        <PhaseActions phase={phase} projectId={projectId} />
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <ol className="grid gap-3 md:grid-cols-3">
          {sortedPhases.map((phase) => {
            const visualStatus = getVisualStatus(phase, isProjectPaused);
            const relatedDocumentPhaseKey = getDocumentPhaseKeyForTimelinePhase(phase.phaseKey, phase.name);
            const isSelected = selectedPhaseKey && relatedDocumentPhaseKey === selectedPhaseKey;
            const href = getTimelineHref({ phase, basePath, displayMode });

            return (
              <li
                key={phase.id}
                className={cn(
                  "rounded-md border p-4 transition-colors",
                  cardClasses[visualStatus],
                  isSelected ? "ring-2 ring-primary/25" : null
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={href} className="flex min-w-0 items-center gap-2 rounded-sm hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <StatusDot tone={visualStatus === "active" ? "active" : visualStatus === "complete" ? "review" : "neutral"} />
                      <span className="truncate text-sm font-medium">{phase.name}</span>
                    </Link>
                    <Badge tone={statusTone[visualStatus]}>{visualStatus}</Badge>
                  </div>
                  {canManage ? (
                    <div className="flex flex-wrap gap-2 border-t pt-3">
                      <PhaseActions phase={phase} projectId={projectId} />
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { deleteDraftProject } from "@/features/projects/actions";
import { formatArchiveReason, getMainProjectState, getProjectStateTone } from "@/features/projects/state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { Deliverable, Project } from "@/types/domain";

type ProjectsListProps = {
  projects: Project[];
  mode: "admin" | "client";
};

type StatusFilter = "all" | "active" | "paused" | "archived";
type ProjectInsightTone = "neutral" | "active" | "warning" | "danger";
type ProjectHealthTone = "active" | "warning" | "danger";

const completedDeliverableStatuses = new Set<Deliverable["status"]>(["approved", "delivered"]);
const dayInMs = 24 * 60 * 60 * 1000;

function parseDate(value: string | null) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function daysUntil(value: string | null) {
  const date = parseDate(value);

  if (!date) {
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.ceil((date.getTime() - today.getTime()) / dayInMs);
}

function formatShortDate(value: string | null) {
  const date = parseDate(value);

  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function formatDayCount(days: number) {
  const absoluteDays = Math.abs(days);

  return `${absoluteDays} ${absoluteDays === 1 ? "day" : "days"}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTimelineProgress(project: Project) {
  const startsOn = parseDate(project.startsOn);
  const endsOn = parseDate(project.endsOn);

  if (!startsOn || !endsOn || endsOn <= startsOn) {
    return project.endsOn ? 0.5 : 0;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return clamp((today.getTime() - startsOn.getTime()) / (endsOn.getTime() - startsOn.getTime()), 0, 1);
}

function getProjectHealth(project: Project): { label: "Healthy" | "Needs attention" | "Not Healthy"; tone: ProjectHealthTone } {
  const totalDeliverables = project.deliverables.length;
  const pendingDeliverables = project.deliverables.filter((deliverable) => !completedDeliverableStatuses.has(deliverable.status));
  const completedRatio = totalDeliverables ? (totalDeliverables - pendingDeliverables.length) / totalDeliverables : 0;
  const timelineProgress = getTimelineProgress(project);
  const progressGap = timelineProgress - completedRatio;
  const projectDaysLeft = daysUntil(project.endsOn);
  const overdueDeliverables = pendingDeliverables.filter((deliverable) => {
    const deliverableDaysLeft = daysUntil(deliverable.expectedDeliveryDate);

    return deliverableDaysLeft !== null && deliverableDaysLeft < 0;
  }).length;
  const dueSoonDeliverables = pendingDeliverables.filter((deliverable) => {
    const deliverableDaysLeft = daysUntil(deliverable.expectedDeliveryDate);

    return deliverableDaysLeft !== null && deliverableDaysLeft >= 0 && deliverableDaysLeft <= 3;
  }).length;

  let score = 100;

  if (!totalDeliverables) {
    score -= 20;
  }

  if (!project.endsOn) {
    score -= 10;
  }

  if (progressGap > 0.5) {
    score -= 35;
  } else if (progressGap > 0.25) {
    score -= 20;
  } else if (progressGap > 0.1) {
    score -= 10;
  }

  score -= Math.min(overdueDeliverables * 25, 45);
  score -= Math.min(dueSoonDeliverables * 8, 20);

  if (projectDaysLeft !== null && projectDaysLeft < 0 && pendingDeliverables.length) {
    score -= 30;
  }

  if (score >= 75) {
    return { label: "Healthy", tone: "active" };
  }

  if (score >= 45) {
    return { label: "Needs attention", tone: "warning" };
  }

  return { label: "Not Healthy", tone: "danger" };
}

function getProjectTimeInsight(project: Project) {
  const remainingDays = daysUntil(project.endsOn);

  if (remainingDays === null) {
    return { label: "Project time", value: "No end date", tone: "neutral" as const };
  }

  if (remainingDays < 0) {
    return { label: "Project time", value: `${formatDayCount(remainingDays)} overdue`, tone: "danger" as const };
  }

  if (remainingDays === 0) {
    return { label: "Project time", value: "Ends today", tone: "warning" as const };
  }

  return {
    label: "Project time",
    value: `${formatDayCount(remainingDays)} left`,
    tone: remainingDays <= 7 ? ("warning" as const) : ("neutral" as const)
  };
}

function getDeliverablesInsight(project: Project) {
  const total = project.deliverables.length;
  const remaining = project.deliverables.filter((deliverable) => !completedDeliverableStatuses.has(deliverable.status)).length;

  if (!total) {
    return { label: "Deliverables", value: "None yet", tone: "neutral" as const };
  }

  if (!remaining) {
    return { label: "Deliverables", value: "All complete", tone: "active" as const };
  }

  return { label: "Deliverables", value: `${remaining} of ${total} left`, tone: "neutral" as const };
}

function getNextDeliveryInsight(project: Project) {
  const nextDeliverable = project.deliverables
    .filter((deliverable) => !completedDeliverableStatuses.has(deliverable.status) && deliverable.expectedDeliveryDate)
    .sort((first, second) => {
      const firstDate = parseDate(first.expectedDeliveryDate)?.getTime() ?? 0;
      const secondDate = parseDate(second.expectedDeliveryDate)?.getTime() ?? 0;

      return firstDate - secondDate;
    })[0];

  if (!nextDeliverable) {
    return { label: "Next delivery", value: "No date set", tone: "neutral" as const };
  }

  const remainingDays = daysUntil(nextDeliverable.expectedDeliveryDate);

  if (remainingDays === null) {
    return { label: "Next delivery", value: "No date set", tone: "neutral" as const };
  }

  if (remainingDays < 0) {
    return { label: "Next delivery", value: `${formatDayCount(remainingDays)} overdue`, tone: "danger" as const };
  }

  if (remainingDays === 0) {
    return { label: "Next delivery", value: "Due today", tone: "warning" as const };
  }

  if (remainingDays <= 7) {
    return { label: "Next delivery", value: `Due in ${formatDayCount(remainingDays)}`, tone: "warning" as const };
  }

  return { label: "Next delivery", value: formatShortDate(nextDeliverable.expectedDeliveryDate) ?? "Scheduled", tone: "neutral" as const };
}

function ProjectInsight({ label, value, tone }: { label: string; value: string; tone: ProjectInsightTone }) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-md border px-2.5 py-2",
        tone === "neutral" && "border-border bg-muted/20 text-muted-foreground",
        tone === "active" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
        tone === "danger" && "border-red-200 bg-red-50 text-red-700"
      )}
    >
      <p className="text-[10px] font-medium uppercase text-current/70">{label}</p>
      <p className="mt-0.5 truncate text-xs font-semibold text-current">{value}</p>
    </div>
  );
}

function ProjectRow({ project, mode }: { project: Project; mode: "admin" | "client" }) {
  const archiveReason = formatArchiveReason(project.archiveReason);
  const canDelete = mode === "admin" && project.activationState === "internal_draft" && ["draft", "proposal_sent"].includes(project.status);
  const href = mode === "admin" ? `/admin/projects/${project.id}` : `/portal/project/${project.id}`;
  const insights = [getProjectTimeInsight(project), getDeliverablesInsight(project), getNextDeliveryInsight(project)];
  const health = getProjectHealth(project);

  return (
    <Card className="transition-colors hover:bg-muted/40">
      <CardContent className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <Link href={href} className="block rounded-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <div>
              <p className="text-sm font-medium">{project.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "admin" ? project.clientName : `Current phase: ${project.currentPhase}`}
              </p>
            </div>
          </Link>
          <details className="group">
            <summary className="inline-flex cursor-pointer list-none items-center [&::-webkit-details-marker]:hidden">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  health.tone === "active" && "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                  health.tone === "warning" && "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
                  health.tone === "danger" && "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                )}
              >
                Health Status: {health.label}
              </span>
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {insights.map((insight) => (
                <ProjectInsight key={insight.label} label={insight.label} value={insight.value} tone={insight.tone} />
              ))}
            </div>
          </details>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {canDelete ? (
            <form action={deleteDraftProject}>
              <input type="hidden" name="projectId" value={project.id} />
              <Button type="submit" variant="danger">Delete</Button>
            </form>
          ) : null}
          <Badge tone={getProjectStateTone(project.status)}>{getMainProjectState(project)}</Badge>
          {archiveReason ? <Badge>{archiveReason}</Badge> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectsList({ projects, mode }: ProjectsListProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [archivedExpanded, setArchivedExpanded] = useState(false);

  const otherProjects = useMemo(
    () => (mode === "admin" ? projects.filter((project) => !["active", "paused", "archived"].includes(project.status)) : []),
    [mode, projects]
  );
  const activeProjects = useMemo(() => projects.filter((project) => project.status === "active"), [projects]);
  const pausedProjects = useMemo(() => projects.filter((project) => project.status === "paused"), [projects]);
  const archivedProjects = useMemo(() => projects.filter((project) => project.status === "archived"), [projects]);

  const visibleOperationalProjects = useMemo(() => {
    if (filter === "active") {
      return activeProjects;
    }

    if (filter === "paused") {
      return pausedProjects;
    }

    if (filter === "archived") {
      return archivedProjects;
    }

    return [...activeProjects, ...pausedProjects];
  }, [activeProjects, archivedProjects, filter, pausedProjects]);

  const showFilters = activeProjects.length > 0 || pausedProjects.length > 0 || archivedProjects.length > 0;

  return (
    <div className="space-y-4">
      {mode === "admin" && otherProjects.length ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Draft and setup projects</p>
          <div className="grid gap-4">
            {otherProjects.map((project) => (
              <ProjectRow key={project.id} project={project} mode={mode} />
            ))}
          </div>
        </div>
      ) : null}

      {showFilters ? (
        <div className="flex flex-wrap gap-2">
          {([
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "paused", label: "Paused" },
            { value: "archived", label: "Archived" }
          ] as Array<{ value: StatusFilter; label: string }>).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setFilter(item.value);
                if (item.value === "archived") {
                  setArchivedExpanded(true);
                }
              }}
              className={cn(
                "rounded-md border px-3 py-2 text-sm transition-colors",
                filter === item.value ? "border-foreground text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {visibleOperationalProjects.length ? (
        <div className="grid gap-4">
          {visibleOperationalProjects.map((project) => (
            <ProjectRow key={project.id} project={project} mode={mode} />
          ))}
        </div>
      ) : filter !== "all" ? (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">No {filter} projects right now.</p>
          </CardContent>
        </Card>
      ) : null}

      {filter === "all" && archivedProjects.length ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <button
              type="button"
              onClick={() => setArchivedExpanded((current) => !current)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Archived Projects
            </button>
            <span className="h-px flex-1 bg-border" />
          </div>
          {archivedExpanded ? (
            <div className="grid gap-4">
              {archivedProjects.map((project) => (
                <ProjectRow key={project.id} project={project} mode={mode} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {!projects.length ? (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {mode === "admin" ? "No projects yet." : "No activated projects are visible for this account yet."}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

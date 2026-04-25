"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { deleteDraftProject } from "@/features/projects/actions";
import { formatArchiveReason, getMainProjectState, getProjectStateTone } from "@/features/projects/state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { Project } from "@/types/domain";

type ProjectsListProps = {
  projects: Project[];
  mode: "admin" | "client";
};

type StatusFilter = "all" | "active" | "paused" | "archived";

function ProjectRow({ project, mode }: { project: Project; mode: "admin" | "client" }) {
  const archiveReason = formatArchiveReason(project.archiveReason);
  const canDelete = mode === "admin" && project.activationState === "internal_draft" && ["draft", "proposal_sent"].includes(project.status);
  const href = mode === "admin" ? `/admin/projects/${project.id}` : `/portal/project/${project.id}`;

  return (
    <div className="relative">
      <Link href={href} className="block">
        <Card className="transition-colors hover:bg-muted/40">
          <CardContent className={cn("flex flex-wrap items-center justify-between gap-3", canDelete ? "pr-28" : undefined)}>
            <div>
              <p className="text-sm font-medium">{project.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "admin" ? project.clientName : `Current phase: ${project.currentPhase}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={getProjectStateTone(project.status)}>{getMainProjectState(project)}</Badge>
              {archiveReason ? <Badge>{archiveReason}</Badge> : null}
            </div>
          </CardContent>
        </Card>
      </Link>
      {canDelete ? (
        <form action={deleteDraftProject} className="absolute right-5 top-1/2 -translate-y-1/2">
          <input type="hidden" name="projectId" value={project.id} />
          <Button type="submit" variant="danger">Delete</Button>
        </form>
      ) : null}
    </div>
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

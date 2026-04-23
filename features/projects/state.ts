import type { ArchiveReason, Project, ProjectStatus } from "@/types/domain";

export type MainProjectState = "Draft" | "Active" | "Paused" | "Archived";

export function getMainProjectState(project: Pick<Project, "status" | "activationState">): MainProjectState {
  if (project.status === "archived") {
    return "Archived";
  }

  if (project.status === "paused") {
    return "Paused";
  }

  if (project.status === "active" || project.activationState === "activated") {
    return "Active";
  }

  return "Draft";
}

export function getProjectStateTone(status: ProjectStatus) {
  if (status === "active") {
    return "active";
  }

  if (status === "paused") {
    return "waiting";
  }

  if (status === "archived") {
    return "neutral";
  }

  return "neutral";
}

export function formatArchiveReason(reason?: ArchiveReason | null) {
  return reason ? reason.replaceAll("_", " ") : null;
}

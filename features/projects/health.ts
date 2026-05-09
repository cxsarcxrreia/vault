import type { Deliverable, Project } from "@/types/domain";

export type ProjectHealthTone = "active" | "warning" | "danger";

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

export function getProjectHealth(project: Project): { label: "Healthy" | "Needs attention" | "Not Healthy"; tone: ProjectHealthTone } {
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

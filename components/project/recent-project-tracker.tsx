"use client";

import { useEffect } from "react";
import {
  RECENT_ADMIN_PROJECTS_STORAGE_KEY,
  RECENT_CLIENT_PROJECTS_STORAGE_KEY,
  RECENT_PROJECTS_UPDATED_EVENT
} from "@/components/layout/app-shell";

type RecentProject = {
  id: string;
  name: string;
  state: string;
  openedAt: number;
};

function readRecentProjects(storageKey: string) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(parsed) ? (parsed as RecentProject[]) : [];
  } catch {
    return [];
  }
}

function RecentProjectTracker({
  project,
  storageKey,
  scopeKey
}: {
  project: {
    id: string;
    name: string;
    state: string;
  };
  storageKey: string;
  scopeKey?: string;
}) {
  useEffect(() => {
    const scopedStorageKey = scopeKey ? `${storageKey}:${scopeKey}` : storageKey;
    const recentProjects = readRecentProjects(scopedStorageKey);
    const nextProjects = [
      {
        ...project,
        openedAt: Date.now()
      },
      ...recentProjects.filter((item) => item.id !== project.id)
    ].slice(0, 4);

    window.localStorage.setItem(scopedStorageKey, JSON.stringify(nextProjects));
    window.dispatchEvent(new Event(RECENT_PROJECTS_UPDATED_EVENT));
  }, [project, scopeKey, storageKey]);

  return null;
}

export function RecentAdminProjectTracker({
  project
}: {
  project: {
    id: string;
    name: string;
    state: string;
    organizationId?: string | null;
  };
}) {
  return (
    <RecentProjectTracker
      project={project}
      storageKey={RECENT_ADMIN_PROJECTS_STORAGE_KEY}
      scopeKey={project.organizationId ? `org:${project.organizationId}` : undefined}
    />
  );
}

export function RecentClientProjectTracker({
  project
}: {
  project: {
    id: string;
    name: string;
    state: string;
  };
}) {
  return <RecentProjectTracker project={project} storageKey={RECENT_CLIENT_PROJECTS_STORAGE_KEY} />;
}

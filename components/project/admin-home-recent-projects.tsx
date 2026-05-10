"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  RECENT_ADMIN_PROJECTS_STORAGE_KEY,
  RECENT_PROJECTS_UPDATED_EVENT
} from "@/components/layout/app-shell";
import { getProjectHealth } from "@/features/projects/health";
import { cn } from "@/lib/utils/cn";
import type { Project } from "@/types/domain";

type StoredRecentProject = {
  id: string;
  openedAt: number;
};

function readRecentProjects(storageKey: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(parsed) ? (parsed as StoredRecentProject[]) : [];
  } catch {
    return [];
  }
}

function getScopedStorageKey(scopeKey?: string) {
  return scopeKey ? `${RECENT_ADMIN_PROJECTS_STORAGE_KEY}:${scopeKey}` : RECENT_ADMIN_PROJECTS_STORAGE_KEY;
}

function getOpenProjects(projects: Project[]) {
  return projects.filter((project) => ["active", "paused"].includes(project.status));
}

function getHealthToneClasses(tone: ReturnType<typeof getProjectHealth>["tone"]) {
  if (tone === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

export function AdminHomeRecentProjects({
  projects,
  recentProjectsScopeKey
}: {
  projects: Project[];
  recentProjectsScopeKey?: string;
}) {
  const [recentProjects, setRecentProjects] = useState<StoredRecentProject[]>([]);
  const storageKey = getScopedStorageKey(recentProjectsScopeKey);

  useEffect(() => {
    const syncRecentProjects = () => {
      setRecentProjects(readRecentProjects(storageKey));
    };

    syncRecentProjects();
    window.addEventListener("storage", syncRecentProjects);
    window.addEventListener(RECENT_PROJECTS_UPDATED_EVENT, syncRecentProjects);

    return () => {
      window.removeEventListener("storage", syncRecentProjects);
      window.removeEventListener(RECENT_PROJECTS_UPDATED_EVENT, syncRecentProjects);
    };
  }, [storageKey]);

  const visibleProjects = useMemo(() => {
    const openProjects = getOpenProjects(projects);
    const projectsById = new Map(openProjects.map((project) => [project.id, project]));
    const recentOpenProjects = recentProjects
      .filter((item) => projectsById.has(item.id))
      .sort((first, second) => second.openedAt - first.openedAt)
      .map((item) => projectsById.get(item.id))
      .filter((project): project is Project => Boolean(project));
    const recentIds = new Set(recentOpenProjects.map((project) => project.id));
    const fallbackProjects = openProjects.filter((project) => !recentIds.has(project.id));

    return [...recentOpenProjects, ...fallbackProjects].slice(0, 4);
  }, [projects, recentProjects]);

  return (
    <section className="space-y-4">
      <h2 className="text-[15px] font-semibold leading-none text-neutral-900">My Recent Projects</h2>
      {visibleProjects.length ? (
        <div className="space-y-2.5">
          {visibleProjects.map((project) => {
            const health = getProjectHealth(project);

            return (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold leading-4 text-neutral-900">{project.name}</span>
                  <span className="mt-1 block truncate text-[12px] leading-4 text-neutral-900/45">{project.clientName}</span>
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none",
                    getHealthToneClasses(health.tone)
                  )}
                >
                  {health.label}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-5">
          <p className="text-sm text-neutral-500">No active projects yet.</p>
        </div>
      )}
      <Link
        href="/admin/projects"
        className="inline-flex h-9 items-center justify-center rounded border border-neutral-200 bg-white px-4 text-[12px] font-medium text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900"
      >
        Explore Projects
      </Link>
    </section>
  );
}

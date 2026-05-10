"use client";

import {
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  UsersRound,
  Workflow,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { signOut } from "@/features/auth/actions";
import { cn } from "@/lib/utils/cn";

const shellFont = {
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  letterSpacing: "0"
};

export const RECENT_ADMIN_PROJECTS_STORAGE_KEY = "vault:recent-admin-projects";
export const RECENT_CLIENT_PROJECTS_STORAGE_KEY = "vault:recent-client-projects";
export const RECENT_PROJECTS_UPDATED_EVENT = "vault:recent-projects-updated";

type NavItem = {
  href: string;
  label: string;
};

type RecentProject = {
  id: string;
  name: string;
  state: string;
  openedAt: number;
};

function isNavItemActive(pathname: string, href: string) {
  if (href === "/portal") {
    return pathname === href || pathname.startsWith("/portal/project/");
  }

  return pathname === href || (href !== "/admin" && href !== "/portal" && pathname.startsWith(`${href}/`));
}

function NavIcon({ item }: { item: NavItem }) {
  if (item.href === "/admin") {
    return <LayoutDashboard className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />;
  }

  if (item.href.includes("clients")) {
    return <UsersRound className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />;
  }

  if (item.href.includes("projects") || item.href === "/portal") {
    return <FolderKanban className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />;
  }

  if (item.href.includes("templates")) {
    return <Workflow className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />;
  }

  if (item.href.includes("billing")) {
    return <CreditCard className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />;
  }

  return <LayoutDashboard className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />;
}

function getProjectStateTone(state: string) {
  if (state === "Active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (state === "Paused") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-border bg-muted text-muted-foreground";
}

function scopedStorageKey(storageKey: string, scopeKey?: string) {
  return scopeKey ? `${storageKey}:${scopeKey}` : storageKey;
}

function getProjectNavConfig(href: string, scopeKey?: string) {
  if (href === "/admin/projects") {
    return {
      hrefPrefix: "/admin/projects",
      storageKey: scopedStorageKey(RECENT_ADMIN_PROJECTS_STORAGE_KEY, scopeKey)
    };
  }

  if (href === "/portal") {
    return {
      hrefPrefix: "/portal/project",
      storageKey: scopedStorageKey(RECENT_CLIENT_PROJECTS_STORAGE_KEY, scopeKey)
    };
  }

  return null;
}

function getCurrentProjectId(pathname: string, hrefPrefix: string) {
  const match = pathname.match(new RegExp(`^${hrefPrefix.replaceAll("/", "\\/")}\\/([^/?#]+)`));
  return match?.[1] ?? null;
}

function readRecentProjects(storageKey: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(parsed) ? (parsed as RecentProject[]) : [];
  } catch {
    return [];
  }
}

function RecentProjectsNav({
  hrefPrefix,
  isPinned,
  pathname,
  storageKey,
  onNavigate
}: {
  hrefPrefix: string;
  isPinned: boolean;
  pathname: string;
  storageKey: string;
  onNavigate?: () => void;
}) {
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const currentProjectId = useMemo(() => getCurrentProjectId(pathname, hrefPrefix), [hrefPrefix, pathname]);

  useEffect(() => {
    const syncRecentProjects = () => {
      setRecentProjects(readRecentProjects(storageKey).slice(0, 4));
    };

    syncRecentProjects();
    window.addEventListener("storage", syncRecentProjects);
    window.addEventListener(RECENT_PROJECTS_UPDATED_EVENT, syncRecentProjects);

    return () => {
      window.removeEventListener("storage", syncRecentProjects);
      window.removeEventListener(RECENT_PROJECTS_UPDATED_EVENT, syncRecentProjects);
    };
  }, [storageKey]);

  if (!recentProjects.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-out",
        isPinned
          ? "max-h-96 translate-y-0 opacity-100"
          : "max-h-0 -translate-y-2 opacity-0 group-hover:max-h-96 group-hover:translate-y-0 group-hover:opacity-100"
      )}
    >
      <div className="mt-1 space-y-1 border-l pl-3">
        {recentProjects.map((project) => {
          const isActive = currentProjectId === project.id;

          return (
            <Link
            key={project.id}
            href={`${hrefPrefix}/${project.id}`}
              onClick={onNavigate}
              className={cn(
                "block rounded-md px-2 py-2 transition-colors hover:bg-muted",
                isActive ? "bg-muted text-foreground" : "text-muted-foreground"
              )}
            >
              <span className="block truncate text-xs font-medium" title={project.name}>
                {project.name}
              </span>
              <span
                className={cn(
                  "mt-1 inline-flex max-w-full items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium leading-none",
                  getProjectStateTone(project.state)
                )}
              >
                {project.state}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function NavLink({
  item,
  pathname,
  onNavigate,
  isMobile = false,
  isMobileProjectsExpanded = false,
  onMobileProjectsExpand,
  recentProjectsScopeKey
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  isMobile?: boolean;
  isMobileProjectsExpanded?: boolean;
  onMobileProjectsExpand?: () => void;
  recentProjectsScopeKey?: string;
}) {
  const isActive = isNavItemActive(pathname, item.href);
  const projectNavConfig = getProjectNavConfig(item.href, recentProjectsScopeKey);
  const isProjectsItem = Boolean(projectNavConfig);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isMobile && isProjectsItem && !isMobileProjectsExpanded && !isActive) {
      event.preventDefault();
      onMobileProjectsExpand?.();
      return;
    }

    onNavigate?.();
  };

  return (
    <div className="group">
      <Link
        href={item.href}
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors",
          isActive
            ? "border-neutral-200 bg-white text-neutral-900"
            : "border-transparent text-neutral-500 hover:bg-white hover:text-neutral-900"
        )}
      >
        <NavIcon item={item} />
        <span>{item.label}</span>
      </Link>
      {projectNavConfig ? (
        <RecentProjectsNav
          hrefPrefix={projectNavConfig.hrefPrefix}
          isPinned={isActive || (isMobile && isMobileProjectsExpanded)}
          pathname={pathname}
          storageKey={projectNavConfig.storageKey}
          onNavigate={onNavigate}
        />
      ) : null}
    </div>
  );
}

export function AppShell({
  area,
  navItems,
  children,
  brandLabel = "VAULT(TM)",
  recentProjectsScopeKey
}: {
  area: string;
  navItems: NavItem[];
  children: React.ReactNode;
  brandLabel?: string;
  recentProjectsScopeKey?: string;
}) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileProjectsExpanded, setIsMobileProjectsExpanded] = useState(false);
  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
    setIsMobileProjectsExpanded(false);
  };

  return (
    <div className="min-h-screen bg-background" style={shellFont}>
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-neutral-200 bg-neutral-50 px-4 py-5 md:block">
        <Link href="/" className="block text-sm font-semibold text-neutral-900">
          {brandLabel}
        </Link>
        <p className="mt-1 text-xs font-medium text-neutral-500">{area}</p>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              onNavigate={closeMobileNav}
              recentProjectsScopeKey={recentProjectsScopeKey}
            />
          ))}
        </nav>
        <form action={signOut} className="absolute bottom-5 left-4 right-4">
          <button className="flex w-full items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-[13px] font-medium text-neutral-500 transition-colors hover:bg-white hover:text-neutral-900">
            <LogOut className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </form>
      </aside>
      <div className="md:pl-64">
        <header className="flex min-h-14 items-center justify-between border-b border-neutral-200 bg-neutral-50 px-5 md:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-lg border bg-white text-neutral-800 transition-colors hover:bg-muted"
              onClick={() => setIsMobileNavOpen((current) => !current)}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-app-nav"
              aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMobileNavOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
            </button>
            <Link href="/" className="text-sm font-semibold text-neutral-900">
              {brandLabel}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{area}</span>
          </div>
        </header>
        {isMobileNavOpen ? (
          <>
            <button
              type="button"
              aria-label="Close navigation overlay"
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
              onClick={closeMobileNav}
            />
            <div
              id="mobile-app-nav"
              className="fixed inset-x-4 top-16 z-50 rounded-xl border bg-neutral-50 p-4 shadow-lg md:hidden"
            >
              <div className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onNavigate={closeMobileNav}
                    isMobile
                    isMobileProjectsExpanded={isMobileProjectsExpanded}
                    onMobileProjectsExpand={() => setIsMobileProjectsExpanded(true)}
                    recentProjectsScopeKey={recentProjectsScopeKey}
                  />
                ))}
              </div>
              <form action={signOut} className="mt-4 border-t pt-4">
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-neutral-500 transition-colors hover:bg-white hover:text-neutral-900">
                  <LogOut className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          </>
        ) : null}
        <main>{children}</main>
      </div>
    </div>
  );
}

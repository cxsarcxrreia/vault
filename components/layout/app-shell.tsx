"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/features/auth/actions";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  label: string;
};

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || (href !== "/admin" && href !== "/portal" && pathname.startsWith(`${href}/`));
}

export function AppShell({
  area,
  navItems,
  children
}: {
  area: string;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card px-4 py-5 md:block">
        <Link href="/" className="block text-sm font-semibold">
          VAULT(TM)
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">{area}</p>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const isActive = isNavItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileNavOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground",
                  isActive ? "font-semibold text-foreground" : "font-normal text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action={signOut} className="absolute bottom-5 left-4 right-4">
          <button className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            Sign out
          </button>
        </form>
      </aside>
      <div className="md:pl-64">
        <header className="flex min-h-14 items-center justify-between border-b bg-card px-6 md:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-md border bg-background text-foreground transition-colors hover:bg-muted"
              onClick={() => setIsMobileNavOpen((current) => !current)}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-app-nav"
              aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMobileNavOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
            </button>
            <Link href="/" className="text-sm font-semibold">
              VAULT(TM)
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
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div
              id="mobile-app-nav"
              className="fixed inset-x-4 top-16 z-50 rounded-xl border bg-card p-4 shadow-lg md:hidden"
            >
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = isNavItemActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground",
                        isActive ? "font-semibold text-foreground" : "font-normal text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              <form action={signOut} className="mt-4 border-t pt-4">
                <button className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  Sign out
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

import Link from "next/link";
import { signOut } from "@/features/auth/actions";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  label: string;
};

export function AppShell({
  area,
  navItems,
  children
}: {
  area: string;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card px-4 py-5 md:block">
        <Link href="/" className="block text-sm font-semibold">
          VAULT™
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">{area}</p>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="absolute bottom-5 left-4 right-4">
          <button className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            Sign out
          </button>
        </form>
      </aside>
      <div className="md:pl-64">
        <header className="flex min-h-14 items-center justify-between border-b bg-card px-6 md:hidden">
          <Link href="/" className="text-sm font-semibold">
            VAULT™
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{area}</span>
            <form action={signOut}>
              <button className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

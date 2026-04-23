import { AppShell } from "@/components/layout/app-shell";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/templates", label: "Templates" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell area="Team panel" navItems={navItems}>
      {children}
    </AppShell>
  );
}

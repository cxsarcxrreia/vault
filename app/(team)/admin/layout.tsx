import { AppShell } from "@/components/layout/app-shell";
import { getCurrentOrganizationName } from "@/features/projects/queries";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/templates", label: "Templates" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const organizationName = await getCurrentOrganizationName();
  const brandLabel = organizationName ? `${organizationName} | VAULT(TM)` : "VAULT(TM)";

  return (
    <AppShell area="Team panel" navItems={navItems} brandLabel={brandLabel}>
      {children}
    </AppShell>
  );
}

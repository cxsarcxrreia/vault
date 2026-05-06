import { AppShell } from "@/components/layout/app-shell";
import { getCurrentOrganizationIdentity } from "@/features/projects/queries";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/templates", label: "Templates" },
  { href: "/admin/billing", label: "Billing" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const organization = await getCurrentOrganizationIdentity();
  const brandLabel = organization ? `${organization.name} | VAULT(TM)` : "VAULT(TM)";
  const recentProjectsScopeKey = organization?.id ? `org:${organization.id}` : undefined;

  return (
    <AppShell
      area="Team panel"
      navItems={navItems}
      brandLabel={brandLabel}
      recentProjectsScopeKey={recentProjectsScopeKey}
    >
      {children}
    </AppShell>
  );
}

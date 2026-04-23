import { AppShell } from "@/components/layout/app-shell";

const navItems = [
  { href: "/portal", label: "Projects" }
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell area="Client portal" navItems={navItems}>
      {children}
    </AppShell>
  );
}

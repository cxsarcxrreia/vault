import Image from "next/image";
import Link from "next/link";
import { Reveal, TypingText } from "@/components/motion/reveal";
import { AdminHomeRecentProjects } from "@/components/project/admin-home-recent-projects";
import { FormMessage } from "@/components/shared/form-message";
import { SetupRequired } from "@/components/shared/setup-required";
import {
  getAdminDashboardMetrics,
  getAdminProjects,
  getCurrentOrganizationIdentity,
  getCurrentProfile
} from "@/features/projects/queries";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const workspaceFont = {
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  letterSpacing: "0"
};

const welcomeFont = {
  fontFamily: '"NdOT 57", Inter, ui-sans-serif, system-ui, sans-serif',
  letterSpacing: "0"
};

const quickActions: Array<{
  label: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}> = [
  { label: "New Project", href: "/admin/projects", imageSrc: "/quick-actions/squarepen.png", imageAlt: "" },
  { label: "New Pipeline", href: "/admin/templates", imageSrc: "/quick-actions/workflow.png", imageAlt: "" },
  { label: "View Dashboard", href: "/admin", imageSrc: "/quick-actions/dotted-dashboard.png", imageAlt: "" },
  { label: "View Clients", href: "/admin/clients", imageSrc: "/quick-actions/users-round.png", imageAlt: "" }
];

function getFirstName(fullName?: string | null) {
  const trimmed = fullName?.trim();

  if (!trimmed) {
    return "César";
  }

  return trimmed.split(/\s+/)[0] ?? "César";
}

function QuickActionCard({ action }: { action: (typeof quickActions)[number] }) {
  return (
    <Link href={action.href} className="group flex min-w-0 flex-col items-center gap-3">
      <span className="flex size-[118px] items-center justify-center rounded-[20px] border border-neutral-200/70 bg-neutral-100 transition duration-200 group-hover:-translate-y-0.5 group-hover:bg-neutral-200">
        <Image
          src={action.imageSrc}
          alt={action.imageAlt}
          width={42}
          height={42}
          className="size-[42px] object-contain opacity-85 transition-opacity group-hover:opacity-95"
          aria-hidden="true"
        />
      </span>
      <span className="text-center text-[12px] font-medium leading-none text-neutral-800">{action.label}</span>
    </Link>
  );
}

const quickActionDelayStart = 220;
const quickActionDelayStep = 110;

function StatRow({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-neutral-100 text-[13px] font-semibold text-neutral-900">
        {value}
      </span>
      <span className="text-[13px] font-medium leading-4 text-neutral-700">{label}</span>
    </div>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = typeof params.error === "string" ? params.error : null;
  const [metricsResult, projectsResult, profile, organization] = await Promise.all([
    getAdminDashboardMetrics(),
    getAdminProjects(),
    getCurrentProfile(),
    getCurrentOrganizationIdentity()
  ]);
  const metrics = metricsResult.data;
  const welcomeText = `Welcome back, ${getFirstName(profile?.full_name)}`;
  const setupMessage = metricsResult.setupRequired
    ? metricsResult.error
    : projectsResult.setupRequired
      ? projectsResult.error
      : null;
  const recentProjectsScopeKey = organization?.id ? `org:${organization.id}` : undefined;

  return (
    <div className="min-h-screen bg-white px-5 pb-16 pt-16 md:px-10 md:pb-24 md:pt-32 xl:pt-40" style={workspaceFont}>
      <div className="mx-auto w-full max-w-[920px] space-y-10">
        <div className="space-y-3">
          {error ? <FormMessage type="error">{error}</FormMessage> : null}
          {setupMessage ? <SetupRequired message={setupMessage} /> : null}
        </div>

        <header className="space-y-1.5">
          <Reveal delay={80} distance={8}>
            <p className="text-[12px] font-medium leading-none text-neutral-900/45">My Workspace</p>
          </Reveal>
          <h1 className="text-[24px] font-semibold leading-tight tracking-normal text-neutral-900 sm:text-[26px]" style={welcomeFont}>
            <TypingText text={welcomeText} delay={1120} duration={880} />
          </h1>
        </header>

        <section aria-label="Quick actions" className="grid grid-cols-2 gap-x-5 gap-y-6 sm:inline-grid sm:grid-cols-4">
          {quickActions.map((action, index) => (
            <Reveal
              key={action.label}
              delay={quickActionDelayStart + index * quickActionDelayStep}
              direction="right"
              distance={16}
            >
              <QuickActionCard action={action} />
            </Reveal>
          ))}
        </section>

        <div className="grid gap-10 pt-2 lg:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.85fr)] lg:gap-12">
          <Reveal delay={760}>
            <AdminHomeRecentProjects projects={projectsResult.data} recentProjectsScopeKey={recentProjectsScopeKey} />
          </Reveal>

          <Reveal delay={880}>
            <section className="space-y-4">
              <h2 className="text-[15px] font-semibold leading-none text-neutral-900">Projects Overview</h2>
              <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4">
                <StatRow value={metrics.activeProjects} label="Active Projects" />
                <StatRow value={metrics.revisionRequests} label="Deliverables need revision from you" />
                <StatRow value={metrics.readyForClientReview} label="Deliverable waiting for client review" />
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

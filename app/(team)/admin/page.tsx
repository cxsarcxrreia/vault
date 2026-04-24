import { PageHeader } from "@/components/layout/page-header";
import { FormMessage } from "@/components/shared/form-message";
import { SetupRequired } from "@/components/shared/setup-required";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getAdminDashboardMetrics } from "@/features/projects/queries";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = typeof params.error === "string" ? params.error : null;
  const result = await getAdminDashboardMetrics();
  const metrics = result.data;

  return (
    <>
      <PageHeader
        eyebrow="Team"
        title="Admin overview"
        description="Manage draft setup, activation, deliverables, documents, and responsibility visibility from one simple shell."
        actions={<ButtonLink href="/admin/projects">View projects</ButtonLink>}
      />
      <div className="space-y-4 p-6">
        {error ? <FormMessage type="error">{error}</FormMessage> : null}
        {result.setupRequired ? <SetupRequired message={result.error} /> : null}
      </div>
      <div className="grid gap-4 px-6 pb-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Active projects</p>
            <p className="mt-2 text-3xl font-semibold">{metrics.activeProjects}</p>
            <p className="mt-2 text-xs text-muted-foreground">Projects currently in operation.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Ready for client review</p>
            <p className="mt-2 text-3xl font-semibold">{metrics.readyForClientReview}</p>
            <p className="mt-2 text-xs text-muted-foreground">Deliverables sent to clients and waiting for approval or a revision request.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Revision requests</p>
            <p className="mt-2 text-3xl font-semibold">{metrics.revisionRequests}</p>
            <p className="mt-2 text-xs text-muted-foreground">Deliverables waiting on team resubmission.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Ready to activate</p>
            <p className="mt-2 text-3xl font-semibold">{metrics.readyToActivate}</p>
            <p className="mt-2 text-xs text-muted-foreground">Projects with payment confirmed but portal not yet active.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

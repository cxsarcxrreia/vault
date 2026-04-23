import { PageHeader } from "@/components/layout/page-header";
import { FormMessage } from "@/components/shared/form-message";
import { SetupRequired } from "@/components/shared/setup-required";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getAdminProjects } from "@/features/projects/queries";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = typeof params.error === "string" ? params.error : null;
  const result = await getAdminProjects();
  const activeProjects = result.data.filter((project) => project.status === "active");

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
      <div className="grid gap-4 px-6 pb-6 md:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Active projects</p>
            <p className="mt-2 text-3xl font-semibold">{activeProjects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Awaiting review</p>
            <p className="mt-2 text-3xl font-semibold">1</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Activation queue</p>
            <p className="mt-2 text-3xl font-semibold">0</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

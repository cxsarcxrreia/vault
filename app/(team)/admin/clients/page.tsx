import { PageHeader } from "@/components/layout/page-header";
import { SetupRequired } from "@/components/shared/setup-required";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getClients } from "@/features/projects/queries";

export default async function ClientsPage() {
  const result = await getClients();

  return (
    <>
      <PageHeader
        eyebrow="Team"
        title="Clients"
        description="Client records connect portal users to activated projects."
      />
      <div className="space-y-4 p-6">
        {result.setupRequired ? <SetupRequired message={result.error} /> : null}
        <Card>
          <CardContent>
            {result.data.length ? (
              <ul className="divide-y">
              {result.data.map((client) => (
                <li key={client.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.primaryContactEmail}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {client.activeProjectId ? (
                      <ButtonLink href={`/portal/project/${client.activeProjectId}`} variant="secondary">
                        View client portal
                      </ButtonLink>
                    ) : null}
                    <Badge tone={client.status === "active" ? "active" : "neutral"}>{client.status}</Badge>
                  </div>
                </li>
              ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No clients yet. Create a draft project to add the first client.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

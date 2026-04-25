import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmSubmitButton } from "@/components/shared/confirm-submit-button";
import { FormMessage } from "@/components/shared/form-message";
import { SetupRequired } from "@/components/shared/setup-required";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteServiceTemplate } from "@/features/projects/actions";
import { getProjectTemplates } from "@/features/projects/queries";
import { getResponsibilityPresetsForTemplate } from "@/features/projects/responsibilities";

type TemplatesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const params = searchParams ? await searchParams : {};
  const created = typeof params.created === "string" ? params.created : null;
  const deleted = typeof params.deleted === "string" ? params.deleted : null;
  const error = typeof params.error === "string" ? params.error : null;
  const result = await getProjectTemplates();

  return (
    <>
      <PageHeader
        eyebrow="Team"
        title="Service templates"
        description="Templates define default macro phases, deliverable suggestions, responsibility presets, and calendar support."
        actions={
          <ButtonLink href="/admin/templates/new" variant="outline">
            Create New Service Template
          </ButtonLink>
        }
      />
      <div className="space-y-4 p-6">
        {error ? <FormMessage type="error">{error}</FormMessage> : null}
        {created === "service-template" ? <FormMessage type="success" autoDismissMs={5000}>Service template created.</FormMessage> : null}
        {deleted === "service-template" ? <FormMessage type="success" autoDismissMs={5000}>Service template deleted.</FormMessage> : null}
        {result.setupRequired ? <SetupRequired message={result.error} /> : null}
        <div className="grid gap-4 lg:grid-cols-3">
          {result.data.map((template) => {
            const normalizedTemplateName = template.name.toLowerCase();
            const hasBuiltInResponsibilityPresets =
              normalizedTemplateName.includes("content production") ||
              normalizedTemplateName.includes("monthly") ||
              normalizedTemplateName.includes("retainer") ||
              normalizedTemplateName.includes("branding") ||
              normalizedTemplateName.includes("graphic design");
            const responsibilityPresets = hasBuiltInResponsibilityPresets ? getResponsibilityPresetsForTemplate(template.name) : [];

            return (
              <Card key={template.id}>
                <CardContent className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold">{template.name}</h2>
                    {template.supportsCalendar ? (
                      <Badge tone="review">
                        <CalendarDays className="mr-1 size-3" />
                        Calendar
                      </Badge>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium uppercase text-muted-foreground">Macro phases</h3>
                    <ol className="space-y-2">
                      {template.defaultPhases.map((phase, index) => (
                        <li key={`${phase}-${index}`} className="flex items-center gap-2 text-sm">
                          <span className="flex size-5 items-center justify-center rounded-full border text-xs text-muted-foreground">
                            {index + 1}
                          </span>
                          {phase}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium uppercase text-muted-foreground">Deliverable suggestions</h3>
                    {template.deliverableTypeSuggestions.length ? (
                      <div className="flex flex-wrap gap-2">
                        {template.deliverableTypeSuggestions.map((item) => (
                          <Badge key={item}>{item}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No deliverable suggestions yet.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium uppercase text-muted-foreground">Responsibility presets</h3>
                    {responsibilityPresets.length ? (
                      <div className="flex flex-wrap gap-2">
                        {responsibilityPresets.map((item) => (
                          <Badge key={item}>{item}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No responsibility presets yet.</p>
                    )}
                  </div>
                  {template.isCustom ? (
                    <form action={deleteServiceTemplate} className="border-t pt-4">
                      <input type="hidden" name="templateId" value={template.id} />
                      <ConfirmSubmitButton
                        triggerLabel="Delete"
                        triggerVariant="danger"
                        title="Delete service template?"
                        description="This permanently deletes this custom template. Projects already created from it will stay in place."
                        confirmLabel="Delete template"
                        confirmVariant="danger"
                      />
                    </form>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}

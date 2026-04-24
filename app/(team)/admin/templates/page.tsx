import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SetupRequired } from "@/components/shared/setup-required";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProjectTemplates } from "@/features/projects/queries";
import { getResponsibilityPresetsForTemplate } from "@/features/projects/responsibilities";

export default async function TemplatesPage() {
  const result = await getProjectTemplates();

  return (
    <>
      <PageHeader
        eyebrow="Team"
        title="Service templates"
        description="Templates define default macro phases, deliverable suggestions, responsibility presets, and calendar support."
      />
      <div className="space-y-4 p-6">
        {result.setupRequired ? <SetupRequired message={result.error} /> : null}
        <div className="grid gap-4 lg:grid-cols-3">
          {result.data.map((template) => (
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
                  <div className="flex flex-wrap gap-2">
                    {template.deliverableTypeSuggestions.map((item) => (
                      <Badge key={item}>{item}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-medium uppercase text-muted-foreground">Responsibility presets</h3>
                  <div className="flex flex-wrap gap-2">
                    {getResponsibilityPresetsForTemplate(template.name).map((item) => (
                      <Badge key={item}>{item}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

import { AppWorkspace, WorkspaceHeader } from "@/components/layout/app-workspace";
import { ServiceTemplateBuilderForm } from "@/components/templates/service-template-builder-form";
import { FormMessage } from "@/components/shared/form-message";
import { ButtonLink } from "@/components/ui/button";

type NewTemplatePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewTemplatePage({ searchParams }: NewTemplatePageProps) {
  const params = searchParams ? await searchParams : {};
  const error = typeof params.error === "string" ? params.error : null;
  const source = params.source === "project-draft" ? "project-draft" : "templates";
  const backHref = source === "project-draft" ? "/admin/projects?resumeDraft=1" : "/admin/templates";

  return (
    <AppWorkspace width="wide">
      <WorkspaceHeader
        label="Team"
        title="Create service template"
        meta={
          source === "project-draft"
            ? "Build a custom macro timeline, then return to the draft project form."
            : "Arrange macro phases into the order this service needs."
        }
        actions={
          <ButtonLink href={backHref} variant="outline">
            Back
          </ButtonLink>
        }
      />
      <div className="space-y-4">
        {error ? <FormMessage type="error">{error}</FormMessage> : null}
        <ServiceTemplateBuilderForm source={source} />
      </div>
    </AppWorkspace>
  );
}

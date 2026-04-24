import { PageHeader } from "@/components/layout/page-header";
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
    <>
      <PageHeader
        eyebrow="Team"
        title="Create service template"
        description={
          source === "project-draft"
            ? "Build a custom macro timeline first, then return to the draft project form with the new template ready to use."
            : "Create a custom service template by arranging the standard macro phases into the order this service needs."
        }
        actions={
          <ButtonLink href={backHref} variant="outline">
            Back
          </ButtonLink>
        }
      />
      <div className="space-y-4 p-6">
        {error ? <FormMessage type="error">{error}</FormMessage> : null}
        <ServiceTemplateBuilderForm source={source} />
      </div>
    </>
  );
}

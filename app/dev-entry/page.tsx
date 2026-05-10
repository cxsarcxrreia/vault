import { ArrowRight } from "lucide-react";
import { PublicHeader, PublicPage, PublicPanel, PublicWorkspace } from "@/components/layout/public-shell";
import { ButtonLink } from "@/components/ui/button";

export default function DevEntryPage() {
  return (
    <PublicPage>
      <PublicWorkspace width="default" className="flex min-h-screen flex-col justify-center py-16">
        <PublicHeader
          label="Internal test entry"
          title="MVP route shortcuts for local testing."
          description="Use these links to jump into the team panel or client portal while developing the product shell."
          actions={
            <>
              <ButtonLink href="/login" className="rounded-lg text-[13px]">
              Sign in
                <ArrowRight className="ml-2 size-4" />
              </ButtonLink>
              <ButtonLink href="/admin" variant="outline" className="rounded-lg text-[13px]">
                Team panel
              </ButtonLink>
              <ButtonLink href="/portal" variant="outline" className="rounded-lg text-[13px]">
                Client portal
              </ButtonLink>
            </>
          }
        />
        <div className="mt-14 grid gap-3 md:grid-cols-3">
          {["Macro timeline", "Deliverables center", "Documents and responsibilities"].map((item) => (
            <PublicPanel key={item} className="p-4">
              <h2 className="text-[14px] font-semibold text-neutral-900">{item}</h2>
              <p className="mt-2 text-[13px] leading-5 text-neutral-500">
                MVP foundation ready for Supabase-backed project operations.
              </p>
            </PublicPanel>
          ))}
        </div>
      </PublicWorkspace>
    </PublicPage>
  );
}

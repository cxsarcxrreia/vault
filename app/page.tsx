import { ArrowRight, CheckCircle2, FolderKanban, Link2, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto grid min-h-screen max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">VAULT for creative agencies</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">
            Client project visibility without the heavy operations stack.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            A minimal portal for timelines, deliverables, approvals, documents, and responsibilities. Keep the creative files in Google Drive and keep the client experience calm.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register">
              Create agency
              <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
            <ButtonLink href="/login" variant="outline">
              Sign in
            </ButtonLink>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="rounded-md border bg-background">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-sm font-medium">Spring Launch Content</p>
                <p className="text-xs text-muted-foreground">Production phase</p>
              </div>
              <span className="rounded-md border bg-muted px-2 py-1 text-xs text-muted-foreground">Client ready</span>
            </div>
            <div className="grid gap-3 p-4">
              {[
                { icon: FolderKanban, label: "Macro timeline", detail: "Onboarding to project complete" },
                { icon: CheckCircle2, label: "Deliverables", detail: "Review, approve, or request revision" },
                { icon: Link2, label: "Documents", detail: "External links for proposals and assets" },
                { icon: ShieldCheck, label: "Agency isolation", detail: "One app, many organizations" }
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="flex items-center gap-3 rounded-md border p-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted">
                      <Icon className="size-4 text-muted-foreground" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

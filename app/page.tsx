import { ArrowRight, CheckCircle2, FolderKanban, Link2, ShieldCheck } from "lucide-react";
import { PublicHeader, PublicNav, PublicPage, PublicPanel, PublicWorkspace } from "@/components/layout/public-shell";
import { ButtonLink } from "@/components/ui/button";

export default function HomePage() {
  return (
    <PublicPage>
      <PublicNav
        actions={
          <>
            <ButtonLink href="/pricing" variant="ghost" className="h-9 rounded-lg px-3 text-[13px] text-neutral-600 hover:text-neutral-900">
              Pricing
            </ButtonLink>
            <ButtonLink href="/login" variant="outline" className="h-9 rounded-lg px-3 text-[13px]">
              Sign in
            </ButtonLink>
          </>
        }
      />
      <PublicWorkspace width="wide" className="pb-16 pt-16 md:pb-24 md:pt-28">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1fr)] lg:items-center">
          <PublicHeader
            label="VAULT for creative agencies"
            title="Client project visibility without the heavy operations stack."
            description="A calm operations layer for timelines, deliverables, approvals, documents, and responsibilities. Keep heavy assets in Google Drive and keep the client experience focused."
            actions={
              <>
                <ButtonLink href="/register" className="h-10 rounded-lg px-4 text-[13px]">
                  Create agency
                  <ArrowRight className="ml-2 size-4" />
                </ButtonLink>
                <ButtonLink href="/pricing" variant="outline" className="h-10 rounded-lg px-4 text-[13px]">
                  View pricing
                </ButtonLink>
              </>
            }
          />

          <PublicPanel className="p-3">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/70">
              <div className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-neutral-900">Spring Launch Content</p>
                  <p className="mt-1 text-[12px] text-neutral-500">Production phase</p>
                </div>
                <span className="w-fit rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-500">
                  Client ready
                </span>
              </div>
              <div className="grid gap-2.5 p-3">
                {[
                  { icon: FolderKanban, label: "Macro timeline", detail: "Onboarding to project complete" },
                  { icon: CheckCircle2, label: "Deliverables", detail: "Review, approve, or request revision" },
                  { icon: Link2, label: "Documents", detail: "External links for proposals and assets" },
                  { icon: ShieldCheck, label: "Agency isolation", detail: "One app, many organizations" }
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-neutral-100">
                        <Icon className="size-4 text-neutral-500" strokeWidth={1.8} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-neutral-900">{item.label}</p>
                        <p className="truncate text-[12px] text-neutral-500 sm:whitespace-normal">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </PublicPanel>
        </section>

        <section className="mt-16 grid gap-3 md:grid-cols-3">
          {[
            ["Portal activation", "Team controls when a client project becomes visible."],
            ["Review loops", "Approvals and revisions stay inside deliverable cards."],
            ["Lightweight assets", "Documents and creative files remain external links for v1."]
          ].map(([title, copy]) => (
            <div key={title} className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
              <h2 className="text-[14px] font-semibold text-neutral-900">{title}</h2>
              <p className="mt-2 text-[13px] leading-5 text-neutral-500">{copy}</p>
            </div>
          ))}
        </section>
      </PublicWorkspace>
    </PublicPage>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { createDraftProject } from "@/features/projects/actions";
import { RESPONSIBILITY_OWNERS, RESPONSIBILITY_STARTER_ROWS } from "@/features/projects/responsibilities";
import type { ProjectTemplate } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const CUSTOM_TEMPLATE_VALUE = "__custom__";
const DRAFT_PROJECT_STORAGE_KEY = "vault:draft-project-template-builder";

type DraftResponsibilityRow = {
  title: string;
  owner: string;
  notes: string;
};

type StoredDraftProjectState = {
  projectName: string;
  clientName: string;
  clientEmail: string;
  templateId: string;
  serviceType: string;
  startsOn: string;
  endsOn: string;
  summary: string;
  includeResponsibilities: boolean;
  responsibilities: DraftResponsibilityRow[];
};

function getDefaultResponsibilityRows(): DraftResponsibilityRow[] {
  return RESPONSIBILITY_STARTER_ROWS.map((row) => ({
    title: row.title,
    owner: row.owner,
    notes: row.notes ?? ""
  }));
}

export function DraftProjectForm({ templates }: { templates: ProjectTemplate[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const templateIdFromQuery = searchParams.get("templateId") ?? "";
  const templateCreated = searchParams.get("templateCreated") === "1";
  const resumeDraft = searchParams.get("resumeDraft") === "1";

  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [templateId, setTemplateId] = useState(templateIdFromQuery);
  const [serviceType, setServiceType] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [summary, setSummary] = useState("");
  const [includeResponsibilities, setIncludeResponsibilities] = useState(false);
  const [responsibilityRows, setResponsibilityRows] = useState<DraftResponsibilityRow[]>(getDefaultResponsibilityRows);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.sessionStorage.getItem(DRAFT_PROJECT_STORAGE_KEY);
    const shouldRestoreDraft = resumeDraft || Boolean(templateIdFromQuery) || templateCreated;
    let animationFrameId = 0;

    if (!shouldRestoreDraft) {
      if (raw) {
        window.sessionStorage.removeItem(DRAFT_PROJECT_STORAGE_KEY);
      }

      return;
    }

    if (raw) {
      try {
        const savedState = JSON.parse(raw) as StoredDraftProjectState;
        animationFrameId = window.requestAnimationFrame(() => {
          setProjectName(savedState.projectName ?? "");
          setClientName(savedState.clientName ?? "");
          setClientEmail(savedState.clientEmail ?? "");
          setTemplateId(templateIdFromQuery || savedState.templateId || "");
          setServiceType(savedState.serviceType ?? "");
          setStartsOn(savedState.startsOn ?? "");
          setEndsOn(savedState.endsOn ?? "");
          setSummary(savedState.summary ?? "");
          setIncludeResponsibilities(Boolean(savedState.includeResponsibilities));
          setResponsibilityRows(savedState.responsibilities?.length ? savedState.responsibilities : getDefaultResponsibilityRows());
        });
      } catch {
        window.sessionStorage.removeItem(DRAFT_PROJECT_STORAGE_KEY);
      }
    } else if (templateIdFromQuery) {
      animationFrameId = window.requestAnimationFrame(() => {
        setTemplateId(templateIdFromQuery);
      });
    }

    if ((raw || templateIdFromQuery || templateCreated || resumeDraft) && detailsRef.current) {
      detailsRef.current.open = true;
    }

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [resumeDraft, templateCreated, templateIdFromQuery]);

  const persistDraftState = () => {
    if (typeof window === "undefined") {
      return;
    }

    const payload: StoredDraftProjectState = {
      projectName,
      clientName,
      clientEmail,
      templateId: "",
      serviceType,
      startsOn,
      endsOn,
      summary,
      includeResponsibilities,
      responsibilities: responsibilityRows
    };

    window.sessionStorage.setItem(DRAFT_PROJECT_STORAGE_KEY, JSON.stringify(payload));
  };

  const clearPersistedDraftState = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.removeItem(DRAFT_PROJECT_STORAGE_KEY);
  };

  const handleResponsibilityChange = (index: number, field: keyof DraftResponsibilityRow, value: string) => {
    setResponsibilityRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row))
    );
  };

  return (
    <details
      ref={detailsRef}
      className="group rounded-xl border border-dashed bg-background transition-colors open:border-solid open:bg-card"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-4 py-4 transition-colors hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground transition-colors group-open:bg-primary group-open:text-primary-foreground">
          <Plus className="size-4 transition-transform group-open:rotate-45" aria-hidden="true" />
        </span>
        <span className="font-semibold">Create draft project</span>
      </summary>
      <Card className="border-x-0 border-b-0 shadow-none">
        <CardHeader>
          <h2 className="font-semibold">Create draft project</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drafts stay internal until payment is confirmed and the team activates the portal.
          </p>
        </CardHeader>
        <CardContent>
          <form
            action={createDraftProject}
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(event) => {
              if (templateId !== CUSTOM_TEMPLATE_VALUE) {
                clearPersistedDraftState();
                return;
              }

              event.preventDefault();
              persistDraftState();
              router.push("/admin/templates/new?source=project-draft");
            }}
          >
            <label className="space-y-2">
              <span className="text-sm font-medium">Project name</span>
              <input
                name="projectName"
                required
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Client name</span>
              <input
                name="clientName"
                required
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Client email</span>
              <input
                name="clientEmail"
                type="email"
                required
                value={clientEmail}
                onChange={(event) => setClientEmail(event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Template</span>
              <select
                name="templateId"
                value={templateId}
                onChange={(event) => setTemplateId(event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Undecided / no template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
                <option value={CUSTOM_TEMPLATE_VALUE}>Create custom template</option>
              </select>
              {templateId === CUSTOM_TEMPLATE_VALUE ? (
                <p className="text-xs text-muted-foreground">
                  Saving this draft will first send you to the service template builder. After the template is saved, you will
                  come back here with your draft details kept in place.
                </p>
              ) : null}
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Service type</span>
              <input
                name="serviceType"
                value={serviceType}
                onChange={(event) => setServiceType(event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">Starts on</span>
                <input
                  name="startsOn"
                  type="date"
                  value={startsOn}
                  onChange={(event) => setStartsOn(event.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Ends on</span>
                <input
                  name="endsOn"
                  type="date"
                  value={endsOn}
                  onChange={(event) => setEndsOn(event.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </label>
            </div>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium">Summary</span>
              <textarea
                name="summary"
                rows={3}
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </label>
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4 md:col-span-2">
              <label className="flex items-start gap-3">
                <input
                  name="includeResponsibilities"
                  value="1"
                  type="checkbox"
                  checked={includeResponsibilities}
                  onChange={(event) => setIncludeResponsibilities(event.target.checked)}
                  className="mt-1 size-4 rounded border"
                />
                <span>
                  <span className="block text-sm font-medium">Add starter responsibility matrix now</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Use this if responsibilities are already clear after onboarding. Otherwise leave it unchecked and complete it later.
                  </span>
                </span>
              </label>
              <details className="group rounded-md border bg-background">
                <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  Customize starter rows
                </summary>
                <div className="space-y-3 border-t p-3">
                  {responsibilityRows.map((row, index) => (
                    <div
                      key={`${row.title}-${index}`}
                      className="grid gap-3 rounded-md border p-3 md:grid-cols-[1.4fr_0.8fr_1.6fr]"
                    >
                      <label className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Responsibility</span>
                        <input
                          name="responsibilityTitle"
                          value={row.title}
                          onChange={(event) => handleResponsibilityChange(index, "title", event.target.value)}
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Owner</span>
                        <select
                          name="responsibilityOwner"
                          value={row.owner}
                          onChange={(event) => handleResponsibilityChange(index, "owner", event.target.value)}
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                        >
                          {RESPONSIBILITY_OWNERS.map((owner) => (
                            <option key={owner.value} value={owner.value}>
                              {owner.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Notes</span>
                        <input
                          name="responsibilityNotes"
                          value={row.notes}
                          onChange={(event) => handleResponsibilityChange(index, "notes", event.target.value)}
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </details>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">{templateId === CUSTOM_TEMPLATE_VALUE ? "Build custom template" : "Create draft"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </details>
  );
}

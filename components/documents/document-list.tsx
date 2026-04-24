import Link from "next/link";
import { FileText, FolderOpen, Plus } from "lucide-react";
import { createProjectDocument, deleteProjectDocument } from "@/features/projects/actions";
import {
  DOCUMENT_PHASES,
  DEFAULT_DOCUMENT_PHASE_KEY,
  getDocumentPhaseDescription,
  getDocumentPhaseLabel
} from "@/features/documents/phases";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { DocumentPhaseKey, ProjectDocument } from "@/types/domain";

type DocumentListProps = {
  documents: ProjectDocument[];
  projectId?: string;
  mode?: "readonly" | "admin";
  activePhaseKey?: DocumentPhaseKey | null;
  basePath?: string;
  timelineView?: "nodes" | "cards";
};

function getFilterHref(basePath: string | undefined, timelineView: "nodes" | "cards" | undefined, phaseKey?: DocumentPhaseKey) {
  const params = new URLSearchParams();
  params.set("timeline", timelineView ?? "nodes");

  if (phaseKey) {
    params.set("phase", phaseKey);
  }

  return `${basePath ?? ""}?${params.toString()}#documents`;
}

export function DocumentList({
  documents,
  projectId,
  mode = "readonly",
  activePhaseKey = null,
  basePath,
  timelineView
}: DocumentListProps) {
  const documentsByPhase = new Map<DocumentPhaseKey, ProjectDocument[]>();

  for (const phase of DOCUMENT_PHASES) {
    documentsByPhase.set(phase.key, []);
  }

  for (const document of documents) {
    const phaseKey = document.phaseKey ?? DEFAULT_DOCUMENT_PHASE_KEY;
    documentsByPhase.set(phaseKey, [...(documentsByPhase.get(phaseKey) ?? []), document]);
  }

  const groupedPhases = DOCUMENT_PHASES.map((phase) => ({
    ...phase,
    documents: documentsByPhase.get(phase.key) ?? []
  }));

  const visibleGroups = activePhaseKey
    ? groupedPhases.filter((phase) => phase.key === activePhaseKey)
    : groupedPhases.filter((phase) => phase.documents.length > 0);
  const canManage = mode === "admin" && Boolean(projectId);

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Link
            href={getFilterHref(basePath, timelineView)}
            aria-current={!activePhaseKey ? "page" : undefined}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              !activePhaseKey ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            All phases
          </Link>
          {DOCUMENT_PHASES.map((phase) => (
            <Link
              key={phase.key}
              href={getFilterHref(basePath, timelineView, phase.key)}
              aria-current={activePhaseKey === phase.key ? "page" : undefined}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                activePhaseKey === phase.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {phase.label}
            </Link>
          ))}
        </div>

        {visibleGroups.length ? (
          <div className="space-y-6">
            {visibleGroups.map((phase) => (
              <section key={phase.key} className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted">
                      <FolderOpen className="size-4 text-muted-foreground" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">{phase.label}</h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{getDocumentPhaseDescription(phase.key)}</p>
                    </div>
                  </div>
                  <Badge>{phase.documents.length} docs</Badge>
                </div>
                {phase.documents.length ? (
                  <ul className="divide-y">
                    {phase.documents.map((document) => (
                      <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted">
                            <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{document.title}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>{document.type}</span>
                              <span aria-hidden="true">/</span>
                              <span>{getDocumentPhaseLabel(document.phaseKey)}</span>
                              {!document.visibleToClient ? (
                                <>
                                  <span aria-hidden="true">/</span>
                                  <span>Internal</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <ButtonLink href={document.externalUrl} variant="outline" target="_blank" rel="noreferrer">
                            Open
                          </ButtonLink>
                          {canManage ? (
                            <form action={deleteProjectDocument}>
                              <input type="hidden" name="projectId" value={projectId} />
                              <input type="hidden" name="documentId" value={document.id} />
                              <Button type="submit" variant="danger">
                                Delete
                              </Button>
                            </form>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
                    No documents have been added for {phase.label.toLowerCase()} yet.
                  </p>
                )}
              </section>
            ))}
          </div>
        ) : (
          <p className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
            No documents have been added yet.
          </p>
        )}

        {canManage ? (
          <details className="group rounded-xl border border-dashed bg-background transition-colors open:border-solid open:bg-card">
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-4 py-4 transition-colors hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground transition-colors group-open:bg-primary group-open:text-primary-foreground">
                <Plus className="size-4 transition-transform group-open:rotate-45" aria-hidden="true" />
              </span>
              <span className="font-semibold">Add document</span>
            </summary>
            <form action={createProjectDocument} className="grid gap-3 border-t p-4 md:grid-cols-[1fr_0.8fr_0.8fr_1.2fr_auto] md:items-end">
              <input type="hidden" name="projectId" value={projectId} />
              <label className="space-y-2">
                <span className="text-sm font-medium">Document title</span>
                <input
                  name="title"
                  placeholder="Approved proposal"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Type</span>
                <input
                  name="documentType"
                  placeholder="Proposal PDF"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Phase</span>
                <select name="phaseKey" defaultValue={activePhaseKey ?? DEFAULT_DOCUMENT_PHASE_KEY} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  {DOCUMENT_PHASES.map((phase) => (
                    <option key={phase.key} value={phase.key}>
                      {phase.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">External link</span>
                <input
                  name="externalUrl"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input name="visibleToClient" value="1" type="checkbox" defaultChecked className="size-4 rounded border" />
                  Client visible
                </label>
                <Button type="submit" className="w-full md:w-auto">
                  Add document
                </Button>
              </div>
            </form>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

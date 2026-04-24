"use client";

import { Fragment, useMemo, useState, type DragEvent } from "react";
import { ArrowRight, FileText, GripVertical, Plus, Trash2 } from "lucide-react";
import { createServiceTemplate } from "@/features/projects/actions";
import { MACRO_PHASES } from "@/features/projects/constants";
import { phaseKeyFromName } from "@/features/projects/template-phases";
import type { TemplatePhaseDefinition } from "@/types/domain";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type ServiceTemplateBuilderFormProps = {
  source?: "templates" | "project-draft";
};

const STARTER_STANDARD_PHASE_KEYS = ["onboarding", "proposal_scope", "deliverables", "project_complete"] as const;

function ensureUniquePhaseKey(name: string, existingPhaseKeys: string[]) {
  const baseKey = phaseKeyFromName(name, existingPhaseKeys.length);

  if (!existingPhaseKeys.includes(baseKey)) {
    return baseKey;
  }

  let suffix = 2;
  let candidate = `${baseKey}_${suffix}`;

  while (existingPhaseKeys.includes(candidate)) {
    suffix += 1;
    candidate = `${baseKey}_${suffix}`;
  }

  return candidate;
}

function DocumentsHint() {
  return (
    <span className="group/tooltip relative inline-flex items-center gap-1">
      <FileText className="size-3" aria-hidden="true" />
      Documents
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-56 -translate-x-1/2 rounded-md border bg-background px-3 py-2 text-left text-[11px] font-normal normal-case tracking-normal text-foreground shadow-lg group-hover/tooltip:block">
        Documents enabled means this phase can appear as its own group in the project Documents section.
      </span>
    </span>
  );
}

function PhaseChip({
  phase,
  draggable = false,
  onDragStart,
  onDragEnd,
  action,
  maxWidthClassName = "md:max-w-[18rem]"
}: {
  phase: TemplatePhaseDefinition;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  action?: React.ReactNode;
  maxWidthClassName?: string;
}) {
  const hasSecondaryMeta = phase.allowsDocuments;

  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
      className={cn(
        "group rounded-lg border bg-background p-3 shadow-sm transition-colors",
        maxWidthClassName,
        draggable ? "cursor-grab active:cursor-grabbing" : null
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex min-w-0 gap-3", hasSecondaryMeta ? "items-start" : "items-center")}>
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground",
              hasSecondaryMeta ? "mt-0.5" : null
            )}
          >
            <GripVertical className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold">{phase.name}</p>
            {phase.allowsDocuments ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <DocumentsHint />
              </div>
            ) : null}
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}

function TimelineDropSlot({
  active,
  onDrop,
  onDragOver,
  label,
  stretch = false
}: {
  active: boolean;
  onDrop: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  label: string;
  stretch?: boolean;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "flex items-center justify-center rounded-md border border-dashed text-[11px] font-medium uppercase tracking-wide text-muted-foreground transition-colors",
        "h-8 shrink-0 md:h-auto",
        stretch ? "md:min-w-[4rem] md:flex-1" : "md:w-16 md:flex-none",
        active ? "border-primary bg-primary/5 text-primary" : "border-border/70 bg-muted/20"
      )}
      aria-label={label}
    >
      <span className="hidden text-sm leading-none md:inline">+</span>
      <span className="md:hidden">Drop here</span>
    </div>
  );
}

export function ServiceTemplateBuilderForm({ source = "templates" }: ServiceTemplateBuilderFormProps) {
  const [templateName, setTemplateName] = useState("");
  const [phaseCatalog, setPhaseCatalog] = useState<TemplatePhaseDefinition[]>(
    MACRO_PHASES.filter((phase) => STARTER_STANDARD_PHASE_KEYS.includes(phase.phaseKey as (typeof STARTER_STANDARD_PHASE_KEYS)[number])).map((phase) => ({
      ...phase
    }))
  );
  const [timelinePhaseKeys, setTimelinePhaseKeys] = useState<Array<TemplatePhaseDefinition["phaseKey"]>>([]);
  const [draggedPhaseKey, setDraggedPhaseKey] = useState<TemplatePhaseDefinition["phaseKey"] | null>(null);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [isLibraryDropActive, setIsLibraryDropActive] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newPhaseAllowsDocuments, setNewPhaseAllowsDocuments] = useState(false);

  const availablePhases = useMemo(
    () => phaseCatalog.filter((phase) => !timelinePhaseKeys.includes(phase.phaseKey)),
    [phaseCatalog, timelinePhaseKeys]
  );

  const orderedTimelinePhases = useMemo(
    () =>
      timelinePhaseKeys
        .map((phaseKey) => phaseCatalog.find((phase) => phase.phaseKey === phaseKey))
        .filter((phase): phase is TemplatePhaseDefinition => Boolean(phase)),
    [phaseCatalog, timelinePhaseKeys]
  );

  const insertPhaseAt = (phaseKey: TemplatePhaseDefinition["phaseKey"], index: number) => {
    setTimelinePhaseKeys((current) => {
      const currentIndex = current.indexOf(phaseKey);
      const withoutPhase = current.filter((item) => item !== phaseKey);
      const next = [...withoutPhase];
      const insertionIndex = currentIndex !== -1 && currentIndex < index ? index - 1 : index;
      next.splice(Math.max(0, Math.min(insertionIndex, next.length)), 0, phaseKey);
      return next;
    });
    setActiveSlotIndex(null);
    setIsLibraryDropActive(false);
    setDraggedPhaseKey(null);
  };

  const removePhaseFromTimeline = (phaseKey: TemplatePhaseDefinition["phaseKey"]) => {
    setTimelinePhaseKeys((current) => current.filter((item) => item !== phaseKey));
    setActiveSlotIndex(null);
    setIsLibraryDropActive(false);
    setDraggedPhaseKey(null);
  };

  const deletePhase = (phaseKey: TemplatePhaseDefinition["phaseKey"]) => {
    setPhaseCatalog((current) => current.filter((phase) => phase.phaseKey !== phaseKey));
    setTimelinePhaseKeys((current) => current.filter((item) => item !== phaseKey));
    setActiveSlotIndex(null);
    setIsLibraryDropActive(false);
    setDraggedPhaseKey(null);
  };

  const handleDropIntoTimeline = (index: number) => {
    if (!draggedPhaseKey) {
      return;
    }

    insertPhaseAt(draggedPhaseKey, index);
  };

  const createCustomPhase = () => {
    const trimmedName = newPhaseName.trim();

    if (!trimmedName) {
      return;
    }

    const nextPhaseKey = ensureUniquePhaseKey(
      trimmedName,
      phaseCatalog.map((phase) => phase.phaseKey)
    );

    setPhaseCatalog((current) => [
      ...current,
      {
        name: trimmedName,
        phaseKey: nextPhaseKey,
        allowsDocuments: newPhaseAllowsDocuments,
        isStandard: false
      }
    ]);
    setNewPhaseName("");
    setNewPhaseAllowsDocuments(false);
  };

  const cancelHref = source === "project-draft" ? "/admin/projects?resumeDraft=1" : "/admin/templates";

  return (
    <form action={createServiceTemplate} className="space-y-6">
      <input type="hidden" name="source" value={source} />
      {orderedTimelinePhases.map((phase) => (
        <input key={phase.phaseKey} type="hidden" name="phaseDefinition" value={JSON.stringify(phase)} />
      ))}

      <Card>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Template name</span>
              <input
                name="templateName"
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="Event launch sprint"
                className="h-10 w-full max-w-xs rounded-md border bg-background px-3 text-sm"
              />
            </label>
          </div>

          <p className="text-sm text-muted-foreground">
            Drag phase nodes into the timeline, reorder them by dropping before or after another node, drag them back out to remove
            them, and delete any custom node you no longer want.
          </p>

          <div className="space-y-6">
            <details className="group rounded-xl border border-dashed bg-background transition-colors open:border-solid open:bg-card">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-4 py-4 transition-colors hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground transition-colors group-open:bg-primary group-open:text-primary-foreground">
                  <Plus className="size-4 transition-transform group-open:rotate-45" aria-hidden="true" />
                </span>
                <span className="font-semibold">Create phase node</span>
              </summary>
              <div className="flex flex-wrap items-center gap-3 border-t p-4">
                <input
                  value={newPhaseName}
                  onChange={(event) => setNewPhaseName(event.target.value)}
                  placeholder="Add a custom phase"
                  className="h-10 w-full max-w-xs rounded-md border bg-background px-3 text-sm"
                />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={newPhaseAllowsDocuments}
                    onChange={(event) => setNewPhaseAllowsDocuments(event.target.checked)}
                    className="size-4 rounded border"
                  />
                  <span className="relative inline-flex items-center">
                    <DocumentsHint />
                  </span>
                </label>
                <Button type="button" onClick={createCustomPhase} disabled={!newPhaseName.trim()} className="h-10 px-4">
                  Create phase node
                </Button>
              </div>
            </details>

            <section
              onDragOver={(event) => {
                if (!draggedPhaseKey) {
                  return;
                }

                event.preventDefault();
                setIsLibraryDropActive(true);
                setActiveSlotIndex(null);
              }}
              onDragLeave={() => setIsLibraryDropActive(false)}
              onDrop={(event) => {
                event.preventDefault();

                if (draggedPhaseKey) {
                  removePhaseFromTimeline(draggedPhaseKey);
                }
              }}
              className={cn(
                "space-y-4 rounded-xl border p-4 transition-colors",
                isLibraryDropActive ? "border-primary bg-primary/5" : "bg-background"
              )}
            >
              <h2 className="text-sm font-semibold">Available phase nodes</h2>
              {availablePhases.length ? (
                <div className="flex flex-wrap gap-3">
                  {availablePhases.map((phase) => (
                    <PhaseChip
                      key={phase.phaseKey}
                      phase={phase}
                      draggable
                      onDragStart={() => setDraggedPhaseKey(phase.phaseKey)}
                      onDragEnd={() => {
                        setDraggedPhaseKey(null);
                        setIsLibraryDropActive(false);
                        setActiveSlotIndex(null);
                      }}
                      maxWidthClassName="md:max-w-[17rem]"
                      action={
                        <div className="flex flex-wrap gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-700 hover:bg-red-50 hover:text-red-800"
                            onClick={() => deletePhase(phase.phaseKey)}
                            aria-label={`Delete ${phase.name}`}
                            title={`Delete ${phase.name}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                  All available phase nodes are already in the timeline.
                </div>
              )}
            </section>

            <section className="space-y-3 rounded-xl border bg-background p-4">
              <h2 className="text-sm font-semibold">Timeline</h2>

              {orderedTimelinePhases.length ? (
                <div className="relative overflow-hidden rounded-xl border bg-muted/20 p-4">
                  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <div className="absolute bottom-4 left-1/2 top-4 hidden w-[3px] -translate-x-1/2 overflow-hidden rounded-full bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)] md:hidden">
                      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/80 opacity-80" />
                      <span className="animate-template-flow-y absolute left-1/2 top-0 h-36 w-4 -translate-x-1/2 rounded-full bg-sky-300/95 shadow-[0_0_32px_rgba(56,189,248,1)] blur-[10px]" />
                      <span className="animate-template-flow-y-core absolute left-1/2 top-0 h-20 w-1.5 -translate-x-1/2 rounded-full bg-white/95 shadow-[0_0_14px_rgba(255,255,255,0.95)] blur-[2px]" />
                    </div>
                    <div className="absolute left-6 right-6 top-1/2 hidden h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)] md:block">
                      <span className="absolute inset-y-0 left-0 right-0 m-auto h-px bg-white/80 opacity-80" />
                      <span className="animate-template-flow-x absolute left-0 top-1/2 h-5 w-44 -translate-y-1/2 rounded-full bg-sky-300/95 shadow-[0_0_32px_rgba(56,189,248,1)] blur-[11px]" />
                      <span className="animate-template-flow-x-core absolute left-0 top-1/2 h-1.5 w-24 -translate-y-1/2 rounded-full bg-white/95 shadow-[0_0_14px_rgba(255,255,255,0.95)] blur-[2px]" />
                    </div>
                  </div>
                  <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-stretch md:gap-3">
                    <TimelineDropSlot
                      active={activeSlotIndex === 0}
                      onDragOver={(event) => {
                        if (!draggedPhaseKey) {
                          return;
                        }

                        event.preventDefault();
                        setActiveSlotIndex(0);
                        setIsLibraryDropActive(false);
                      }}
                      onDrop={() => handleDropIntoTimeline(0)}
                      label="Insert before the first phase"
                      stretch
                    />
                    {orderedTimelinePhases.map((phase, index) => (
                      <Fragment key={phase.phaseKey}>
                        <div
                          draggable
                          onDragStart={() => setDraggedPhaseKey(phase.phaseKey)}
                          onDragEnd={() => {
                            setDraggedPhaseKey(null);
                            setActiveSlotIndex(null);
                            setIsLibraryDropActive(false);
                          }}
                          className="relative cursor-grab rounded-xl border bg-background p-4 shadow-sm active:cursor-grabbing md:w-[12.5rem] md:max-w-[12.5rem] md:flex-none"
                        >
                            <div className="flex h-full flex-col items-center justify-between gap-4 text-center">
                            <div className="space-y-3">
                              <span className="mx-auto flex size-11 items-center justify-center rounded-full border-2 border-sky-300 bg-sky-50 text-sky-800 shadow-sm ring-4 ring-sky-100">
                                <GripVertical className="size-4" aria-hidden="true" />
                              </span>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">{phase.name}</p>
                                <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                                  <span>{index + 1} in flow</span>
                                  {phase.allowsDocuments ? (
                                    <>
                                      <span aria-hidden="true">/</span>
                                      <DocumentsHint />
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-700 hover:bg-red-50 hover:text-red-800"
                                onClick={() => deletePhase(phase.phaseKey)}
                                aria-label={`Delete ${phase.name}`}
                                title={`Delete ${phase.name}`}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <TimelineDropSlot
                          active={activeSlotIndex === index + 1}
                          onDragOver={(event) => {
                            if (!draggedPhaseKey) {
                              return;
                            }

                            event.preventDefault();
                            setActiveSlotIndex(index + 1);
                            setIsLibraryDropActive(false);
                          }}
                          onDrop={() => handleDropIntoTimeline(index + 1)}
                          label={`Insert after ${phase.name}`}
                          stretch={index === orderedTimelinePhases.length - 1}
                        />
                      </Fragment>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(event) => {
                    if (!draggedPhaseKey) {
                      return;
                    }

                    event.preventDefault();
                    setActiveSlotIndex(0);
                  }}
                  onDrop={() => handleDropIntoTimeline(0)}
                  className={cn(
                    "rounded-xl border border-dashed px-6 py-12 text-center transition-colors",
                    activeSlotIndex === 0 ? "border-primary bg-primary/5" : "bg-muted/20"
                  )}
                >
                  <div className="mx-auto max-w-sm space-y-3">
                    <span className="mx-auto flex size-12 items-center justify-center rounded-full border bg-background text-muted-foreground">
                      <ArrowRight className="size-5" aria-hidden="true" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Start the timeline here</p>
                      <p className="text-sm text-muted-foreground">
                        Drop any phase node into the empty timeline to begin building the flow.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          <style jsx>{`
            .animate-template-flow-x {
              animation: template-flow-x 2.2s linear infinite;
            }

            .animate-template-flow-x-core {
              animation: template-flow-x 2.2s linear infinite;
            }

            .animate-template-flow-y {
              animation: template-flow-y 2.2s linear infinite;
            }

            .animate-template-flow-y-core {
              animation: template-flow-y 2.2s linear infinite;
            }

            @keyframes template-flow-x {
              0% {
                transform: translate(-120%, -50%);
              }

              100% {
                transform: translate(700%, -50%);
              }
            }

            @keyframes template-flow-y {
              0% {
                transform: translate(-50%, -120%);
              }

              100% {
                transform: translate(-50%, 700%);
              }
            }
          `}</style>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              {orderedTimelinePhases.length
                ? `${orderedTimelinePhases.length} macro phase${orderedTimelinePhases.length === 1 ? "" : "s"} selected.`
                : "Choose at least one macro phase before saving the template."}
            </p>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href={cancelHref} variant="ghost">
                Cancel
              </ButtonLink>
              <Button type="submit" disabled={!templateName.trim() || !orderedTimelinePhases.length}>
                Save service template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

import type { DocumentPhaseKey } from "@/types/domain";

export const DOCUMENT_PHASE_KEY_VALUES = [
  "onboarding",
  "proposal_scope",
  "creative_direction",
  "production",
  "deliverables",
  "general"
] as const;

export const DOCUMENT_PHASES: Array<{ key: DocumentPhaseKey; label: string; description: string }> = [
  {
    key: "onboarding",
    label: "Onboarding",
    description: "Intake notes, onboarding summaries, kickoff references, and access details."
  },
  {
    key: "proposal_scope",
    label: "Proposal and Scope",
    description: "Proposal PDFs, contracts, approved scope, and commercial setup documents."
  },
  {
    key: "creative_direction",
    label: "Creative Direction",
    description: "Pitch decks, moodboards, concepts, references, and direction notes."
  },
  {
    key: "production",
    label: "Production",
    description: "Production plans, schedules, shot lists, and working references."
  },
  {
    key: "deliverables",
    label: "Deliverables",
    description: "Delivery notes and handoff documents that support the dedicated deliverables section."
  },
  {
    key: "general",
    label: "General",
    description: "Useful project documents that do not belong to one macro phase."
  }
];

export const DOCUMENT_PHASE_KEYS = [...DOCUMENT_PHASE_KEY_VALUES];
export const DEFAULT_DOCUMENT_PHASE_KEY: DocumentPhaseKey = "general";

const phaseKeyAliases: Record<string, DocumentPhaseKey> = {
  onboarding: "onboarding",
  proposal_scope: "proposal_scope",
  proposal_and_scope: "proposal_scope",
  creative_direction: "creative_direction",
  production: "production",
  deliverables: "deliverables",
  general: "general"
};

function formatPhaseLabel(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeDocumentPhaseKey(value: string | null | undefined): DocumentPhaseKey | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .toLowerCase()
    .trim()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return phaseKeyAliases[normalized] ?? (normalized || null);
}

export function getDocumentPhaseLabel(phaseKey: DocumentPhaseKey) {
  return DOCUMENT_PHASES.find((phase) => phase.key === phaseKey)?.label ?? formatPhaseLabel(phaseKey);
}

export function getDocumentPhaseDescription(phaseKey: DocumentPhaseKey) {
  return (
    DOCUMENT_PHASES.find((phase) => phase.key === phaseKey)?.description ??
    "Documents grouped under this custom project phase."
  );
}

export function getDocumentPhaseKeyForTimelinePhase(phaseKey: string, phaseName: string): DocumentPhaseKey | null {
  return normalizeDocumentPhaseKey(phaseKey) ?? normalizeDocumentPhaseKey(phaseName);
}

export function getDocumentPhaseOrderForProjectPhases(
  phases: Array<{ phaseKey: string; name: string; allowsDocuments?: boolean }>
): DocumentPhaseKey[] {
  const orderedKeys: DocumentPhaseKey[] = [];
  const seen = new Set<DocumentPhaseKey>();

  for (const phase of phases) {
    if (phase.allowsDocuments === false) {
      continue;
    }

    const documentPhaseKey = getDocumentPhaseKeyForTimelinePhase(phase.phaseKey, phase.name);

    if (documentPhaseKey && !seen.has(documentPhaseKey)) {
      seen.add(documentPhaseKey);
      orderedKeys.push(documentPhaseKey);
    }
  }

  return orderedKeys;
}

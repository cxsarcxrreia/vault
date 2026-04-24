import type { TemplatePhaseDefinition } from "@/types/domain";
import { MACRO_PHASES } from "./constants";

function toTemplatePhaseDefinition(value: unknown, index: number): TemplatePhaseDefinition | null {
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const matchingStandardPhase = MACRO_PHASES.find(
      (phase) =>
        phase.name.toLowerCase() === trimmed.toLowerCase() ||
        phase.phaseKey === phaseKeyFromName(trimmed, index)
    );

    if (matchingStandardPhase) {
      return { ...matchingStandardPhase };
    }

    return {
      name: trimmed,
      phaseKey: phaseKeyFromName(trimmed, index),
      allowsDocuments: false,
      isStandard: false
    };
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as {
    name?: unknown;
    phaseKey?: unknown;
    phase_key?: unknown;
    allowsDocuments?: unknown;
    allows_documents?: unknown;
    isStandard?: unknown;
    is_standard?: unknown;
  };

  const name = typeof row.name === "string" ? row.name.trim() : "";
  const explicitPhaseKey =
    typeof row.phaseKey === "string"
      ? row.phaseKey
      : typeof row.phase_key === "string"
        ? row.phase_key
        : "";
  const resolvedPhaseKey = phaseKeyFromName(explicitPhaseKey || name, index);

  if (!name || !resolvedPhaseKey) {
    return null;
  }

  const matchingStandardPhase = MACRO_PHASES.find((phase) => phase.phaseKey === resolvedPhaseKey);
  const allowsDocuments =
    typeof row.allowsDocuments === "boolean"
      ? row.allowsDocuments
      : typeof row.allows_documents === "boolean"
        ? row.allows_documents
        : matchingStandardPhase?.allowsDocuments ?? false;
  const isStandard =
    typeof row.isStandard === "boolean"
      ? row.isStandard
      : typeof row.is_standard === "boolean"
        ? row.is_standard
        : matchingStandardPhase?.isStandard ?? false;

  return {
    name,
    phaseKey: resolvedPhaseKey,
    allowsDocuments,
    isStandard
  };
}

export function getFallbackPhaseDefinitions(): TemplatePhaseDefinition[] {
  return MACRO_PHASES.map((phase) => ({ ...phase }));
}

export function getFallbackPhaseNames() {
  return getFallbackPhaseDefinitions().map((phase) => phase.name);
}

export function templatePhaseDefinitionsFromDefault(defaultPhases: unknown): TemplatePhaseDefinition[] {
  if (!Array.isArray(defaultPhases)) {
    return getFallbackPhaseDefinitions();
  }

  const phaseDefinitions = defaultPhases
    .map((phase, index) => toTemplatePhaseDefinition(phase, index))
    .filter((phase): phase is TemplatePhaseDefinition => Boolean(phase));

  return phaseDefinitions.length ? phaseDefinitions : getFallbackPhaseDefinitions();
}

export function phaseNamesFromTemplateDefault(defaultPhases: unknown) {
  return templatePhaseDefinitionsFromDefault(defaultPhases).map((phase) => phase.name);
}

export function phaseKeyFromName(name: string, index: number) {
  const key = name
    .toLowerCase()
    .trim()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (key === "proposal_and_scope") {
    return "proposal_scope";
  }

  return key || `phase_${index + 1}`;
}

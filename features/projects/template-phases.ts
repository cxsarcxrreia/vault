import { MACRO_PHASES } from "./constants";

export function getFallbackPhaseNames() {
  return MACRO_PHASES.map((phase) => phase.name);
}

export function phaseNamesFromTemplateDefault(defaultPhases: unknown) {
  if (!Array.isArray(defaultPhases)) {
    return getFallbackPhaseNames();
  }

  const names = defaultPhases
    .filter((phase): phase is string => typeof phase === "string")
    .map((phase) => phase.trim())
    .filter(Boolean);

  return names.length ? names : getFallbackPhaseNames();
}

export function phaseKeyFromName(name: string, index: number) {
  const key = name
    .toLowerCase()
    .trim()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return key || `phase_${index + 1}`;
}

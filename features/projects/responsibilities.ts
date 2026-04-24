import type { ResponsibilityOwner } from "@/types/domain";

export const RESPONSIBILITY_OWNERS: Array<{
  value: ResponsibilityOwner;
  label: string;
  description: string;
}> = [
  { value: "agency", label: "Agency", description: "Handled by the internal team." },
  { value: "client", label: "Client", description: "Owned by the client." },
  { value: "external", label: "External", description: "Handled by a contractor, partner, or outside collaborator." },
  { value: "shared", label: "Shared", description: "Requires both agency and client input." }
];

export const RESPONSIBILITY_STARTER_ROWS: Array<{
  title: string;
  owner: ResponsibilityOwner;
  notes: string;
}> = [
  { title: "Content planning", owner: "shared", notes: "Agree on goals, references, and priorities." },
  { title: "Creative direction", owner: "agency", notes: "Define the creative approach and production direction." },
  { title: "Assets and access", owner: "client", notes: "Provide brand files, account access, or source materials." },
  { title: "Production", owner: "agency", notes: "Coordinate production work and deliverable preparation." },
  { title: "Specialized support", owner: "external", notes: "Optional contractor or outside collaborator work." },
  { title: "Feedback and approvals", owner: "client", notes: "Review deliverables and approve or request revisions." }
];

const RESPONSIBILITY_PRESETS_BY_TEMPLATE = {
  contentProduction: [
    "Creative Direction",
    "Shooting Content",
    "Video Editing",
    "Photo Editing",
    "Publishing",
    "Ad Management",
  ],
  monthlyRetainer: [
    "Content Planning",
    "Monthly Shooting",
    "Editing Batch",
    "Scheduling",
    "Publishing",
    "Community Management",
    "Reporting",
    "Ad Management"
  ],
  brandingDesign: [
    "Brand Strategy",
    "Creative Direction",
    "Logo Design",
    "Brand Guidelines",
    "Graphic Design",
    "Template Design",
    "Asset Handoff",
  ]
} as const;

export function getResponsibilityOwnerLabel(owner: ResponsibilityOwner) {
  return RESPONSIBILITY_OWNERS.find((item) => item.value === owner)?.label ?? owner;
}

function uniquePresetTitles(items: string[]) {
  return Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));
}

export function getResponsibilityPresetsForTemplate(templateName?: string): string[] {
  const normalized = templateName?.toLowerCase() ?? "";

  if (normalized.includes("content production")) {
    return [...RESPONSIBILITY_PRESETS_BY_TEMPLATE.contentProduction];
  }

  if (normalized.includes("monthly") || normalized.includes("retainer")) {
    return [...RESPONSIBILITY_PRESETS_BY_TEMPLATE.monthlyRetainer];
  }

  if (normalized.includes("branding") || normalized.includes("graphic design")) {
    return [...RESPONSIBILITY_PRESETS_BY_TEMPLATE.brandingDesign];
  }

  return uniquePresetTitles([
    ...RESPONSIBILITY_PRESETS_BY_TEMPLATE.contentProduction,
    ...RESPONSIBILITY_PRESETS_BY_TEMPLATE.monthlyRetainer,
    ...RESPONSIBILITY_PRESETS_BY_TEMPLATE.brandingDesign
  ]);
}

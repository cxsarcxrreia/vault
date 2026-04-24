export const MACRO_PHASES = [
  { name: "Onboarding", phaseKey: "onboarding", allowsDocuments: true, isStandard: true },
  { name: "Proposal and Scope", phaseKey: "proposal_scope", allowsDocuments: true, isStandard: true },
  { name: "Creative Direction", phaseKey: "creative_direction", allowsDocuments: true, isStandard: true },
  { name: "Production", phaseKey: "production", allowsDocuments: true, isStandard: true },
  { name: "Deliverables", phaseKey: "deliverables", allowsDocuments: true, isStandard: true },
  { name: "Project Complete", phaseKey: "project_complete", allowsDocuments: false, isStandard: true }
] as const;

export const MACRO_PHASE_KEYS = MACRO_PHASES.map((phase) => phase.phaseKey) as [
  (typeof MACRO_PHASES)[number]["phaseKey"],
  ...(typeof MACRO_PHASES)[number]["phaseKey"][]
];

export const APPROVAL_SOURCES = ["whatsapp", "email", "call", "admin_override"] as const;

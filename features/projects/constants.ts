export const MACRO_PHASES = [
  { name: "Onboarding", phaseKey: "onboarding" },
  { name: "Proposal and Scope", phaseKey: "proposal_scope" },
  { name: "Creative Direction", phaseKey: "creative_direction" },
  { name: "Production", phaseKey: "production" },
  { name: "Deliverables", phaseKey: "deliverables" },
  { name: "Project Complete", phaseKey: "project_complete" }
] as const;

export const APPROVAL_SOURCES = ["whatsapp", "email", "call", "admin_override"] as const;

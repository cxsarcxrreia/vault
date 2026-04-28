import type { Client, Project, ProjectTemplate } from "@/types/domain";

export const projectTemplates: ProjectTemplate[] = [
  {
    id: "template-content-production",
    name: "One time Content Production",
    slug: "one-time-content-production",
    supportsCalendar: false,
    phaseDefinitions: [
      { name: "Onboarding", phaseKey: "onboarding", allowsDocuments: true, isStandard: true },
      { name: "Proposal and Scope", phaseKey: "proposal_scope", allowsDocuments: true, isStandard: true },
      { name: "Creative Direction", phaseKey: "creative_direction", allowsDocuments: true, isStandard: true },
      { name: "Production", phaseKey: "production", allowsDocuments: true, isStandard: true },
      { name: "Deliverables", phaseKey: "deliverables", allowsDocuments: true, isStandard: true },
      { name: "Project Complete", phaseKey: "project_complete", allowsDocuments: false, isStandard: true }
    ],
    defaultPhases: ["Onboarding", "Proposal and Scope", "Creative Direction", "Production", "Deliverables", "Project Complete"],
    deliverableTypeSuggestions: ["Reels", "Photos", "Promo video", "Aftermovie", "Supporting assets"]
  },
  {
    id: "template-monthly-retainer",
    name: "Monthly Content Retainer",
    slug: "monthly-content-retainer",
    supportsCalendar: true,
    phaseDefinitions: [
      { name: "Onboarding", phaseKey: "onboarding", allowsDocuments: true, isStandard: true },
      { name: "Proposal and Scope", phaseKey: "proposal_scope", allowsDocuments: true, isStandard: true },
      { name: "Creative Direction", phaseKey: "creative_direction", allowsDocuments: true, isStandard: true },
      { name: "Production", phaseKey: "production", allowsDocuments: true, isStandard: true },
      { name: "Deliverables", phaseKey: "deliverables", allowsDocuments: true, isStandard: true },
      { name: "Project Complete", phaseKey: "project_complete", allowsDocuments: false, isStandard: true }
    ],
    defaultPhases: ["Onboarding", "Proposal and Scope", "Creative Direction", "Production", "Deliverables", "Project Complete"],
    deliverableTypeSuggestions: ["Monthly reels", "Monthly photos", "Captions", "Story sets", "Graphic assets"]
  },
  {
    id: "template-branding-design",
    name: "Branding / Graphic Design",
    slug: "branding-graphic-design",
    supportsCalendar: false,
    phaseDefinitions: [
      { name: "Onboarding", phaseKey: "onboarding", allowsDocuments: true, isStandard: true },
      { name: "Proposal and Scope", phaseKey: "proposal_scope", allowsDocuments: true, isStandard: true },
      { name: "Creative Direction", phaseKey: "creative_direction", allowsDocuments: true, isStandard: true },
      { name: "Production", phaseKey: "production", allowsDocuments: true, isStandard: true },
      { name: "Deliverables", phaseKey: "deliverables", allowsDocuments: true, isStandard: true },
      { name: "Project Complete", phaseKey: "project_complete", allowsDocuments: false, isStandard: true }
    ],
    defaultPhases: ["Onboarding", "Proposal and Scope", "Creative Direction", "Production", "Deliverables", "Project Complete"],
    deliverableTypeSuggestions: ["Logo pack", "Brand book", "Templates", "Color palette", "Typography set"]
  }
];

export const clients: Client[] = [
  {
    id: "client-sample",
    name: "Northline Studio",
    primaryContactEmail: "client@example.com",
    status: "active"
  }
];

export const projects: Project[] = [
  {
    id: "project-sample",
    name: "Spring Launch Content",
    clientName: "Northline Studio",
    summary: "A one-time production package for launch assets, review, and final delivery links.",
    status: "active",
    activationState: "activated",
    currentPhase: "Production",
    templateName: "One time Content Production",
    startsOn: "2026-04-20",
    endsOn: "2026-05-15",
    supportsCalendar: false,
    phases: [
      { id: "phase-1", name: "Onboarding", phaseKey: "onboarding", allowsDocuments: true, status: "complete", position: 1 },
      { id: "phase-2", name: "Proposal and Scope", phaseKey: "proposal_scope", allowsDocuments: true, status: "complete", position: 2 },
      { id: "phase-3", name: "Creative Direction", phaseKey: "creative_direction", allowsDocuments: true, status: "complete", position: 3 },
      { id: "phase-4", name: "Production", phaseKey: "production", allowsDocuments: true, status: "active", position: 4 },
      { id: "phase-5", name: "Deliverables", phaseKey: "deliverables", allowsDocuments: true, status: "not_started", position: 5 },
      { id: "phase-6", name: "Project Complete", phaseKey: "project_complete", allowsDocuments: false, status: "not_started", position: 6 }
    ],
    deliverables: [
      {
        id: "deliverable-1",
        title: "Launch Reel Batch",
        type: "Reels",
        status: "ready_for_review",
        expectedDeliveryDate: "2026-05-01",
        expectedDeliveryDateChangedForRevision: false,
        revisionLimit: 2,
        revisionsRemaining: 2,
        externalUrl: "https://drive.google.com"
      },
      {
        id: "deliverable-2",
        title: "Edited Photo Selects",
        type: "Photos",
        status: "editing",
        expectedDeliveryDate: "2026-05-05",
        expectedDeliveryDateChangedForRevision: false,
        revisionLimit: 1,
        revisionsRemaining: 1,
        externalUrl: null
      }
    ],
    documents: [
      {
        id: "document-1",
        title: "Approved Proposal",
        type: "Proposal PDF",
        phaseKey: "proposal_scope",
        externalUrl: "https://drive.google.com",
        visibleToClient: true
      },
      {
        id: "document-2",
        title: "Scope Summary",
        type: "Scope summary",
        phaseKey: "proposal_scope",
        externalUrl: "https://drive.google.com",
        visibleToClient: true
      },
      {
        id: "document-3",
        title: "Onboarding Summary",
        type: "Onboarding notes",
        phaseKey: "onboarding",
        externalUrl: "https://drive.google.com",
        visibleToClient: true
      },
      {
        id: "document-4",
        title: "Moodboard Direction",
        type: "Moodboard",
        phaseKey: "creative_direction",
        externalUrl: "https://drive.google.com",
        visibleToClient: true
      },
      {
        id: "document-5",
        title: "Production Schedule",
        type: "Production plan",
        phaseKey: "production",
        externalUrl: "https://drive.google.com",
        visibleToClient: false
      }
    ],
    responsibilities: [
      { id: "responsibility-1", title: "Content planning", owner: "shared" },
      { id: "responsibility-2", title: "Shooting", owner: "agency" },
      { id: "responsibility-3", title: "Publishing", owner: "client" }
    ]
  }
];

export function getProjectById(id: string) {
  return projects.find((project) => project.id === id) ?? projects[0];
}

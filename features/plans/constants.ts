export const PLAN_TIERS = ["free", "medium", "premium"] as const;

export type PlanTier = (typeof PLAN_TIERS)[number];
export type SubscriptionStatus = "free" | "active" | "trialing" | "manual" | "past_due" | "canceled";

export type PlanDefinition = {
  tier: PlanTier;
  name: string;
  priceMonthly: number;
  priceLabel: string;
  projectLimit: number | null;
  projectLimitLabel: string;
  shortDescription: string;
  ctaLabel: string;
  isPopular?: boolean;
};

export type PlanUsageSummary = {
  planTier: PlanTier;
  planName: string;
  activeProjectCount: number;
  projectLimit: number | null;
  usageLabel: string;
  isLimitReached: boolean;
};

export const PLAN_ORDER = ["free", "medium", "premium"] as const;

export const PLAN_DEFINITIONS: Record<PlanTier, PlanDefinition> = {
  free: {
    tier: "free",
    name: "Free",
    priceMonthly: 0,
    priceLabel: "€0/month",
    projectLimit: 2,
    projectLimitLabel: "Up to 2 non-archived projects",
    shortDescription: "A quiet starting point for a small agency workspace.",
    ctaLabel: "Start free"
  },
  medium: {
    tier: "medium",
    name: "Medium",
    priceMonthly: 10,
    priceLabel: "€10/month",
    projectLimit: 30,
    projectLimitLabel: "Up to 30 non-archived projects",
    shortDescription: "Room for active client operations across a growing agency.",
    ctaLabel: "Choose Medium",
    isPopular: true
  },
  premium: {
    tier: "premium",
    name: "Premium",
    priceMonthly: 50,
    priceLabel: "€50/month",
    projectLimit: null,
    projectLimitLabel: "Unlimited non-archived projects",
    shortDescription: "Unlimited project capacity for established agency teams.",
    ctaLabel: "Choose Premium"
  }
};

export const PROJECT_LIMIT_COUNT_DESCRIPTION =
  "Draft, proposal, payment-confirmed, active, paused, and complete projects count toward plan limits. Archived projects do not count.";

export function isPlanTier(value: string | null | undefined): value is PlanTier {
  return PLAN_TIERS.includes(value as PlanTier);
}

export function normalizePlanTier(value: string | null | undefined): PlanTier {
  return isPlanTier(value) ? value : "free";
}

export function getPlanDefinition(value: string | null | undefined) {
  return PLAN_DEFINITIONS[normalizePlanTier(value)];
}

export function getProjectLimitForPlan(value: string | null | undefined) {
  return getPlanDefinition(value).projectLimit;
}

export function isProjectLimitReached(planTier: string | null | undefined, projectCount: number) {
  const limit = getProjectLimitForPlan(planTier);
  return limit !== null && projectCount >= limit;
}

export function formatProjectUsage(planTier: string | null | undefined, projectCount: number) {
  const plan = getPlanDefinition(planTier);
  return plan.projectLimit === null
    ? `${projectCount} / unlimited projects`
    : `${projectCount} / ${plan.projectLimit} projects`;
}

export function toPlanUsageSummary(planTier: string | null | undefined, activeProjectCount: number): PlanUsageSummary {
  const plan = getPlanDefinition(planTier);

  return {
    planTier: plan.tier,
    planName: plan.name,
    activeProjectCount,
    projectLimit: plan.projectLimit,
    usageLabel: formatProjectUsage(plan.tier, activeProjectCount),
    isLimitReached: isProjectLimitReached(plan.tier, activeProjectCount)
  };
}

import "server-only";

import {
  getPlanDefinition,
  isProjectLimitReached,
  toPlanUsageSummary,
  type PlanTier,
  type PlanUsageSummary,
  type SubscriptionStatus
} from "./constants";

export type OrganizationPlanUsage = PlanUsageSummary & {
  organizationId: string;
  organizationName: string;
  subscriptionStatus: SubscriptionStatus;
  membershipRole?: "owner" | "admin" | "member";
  canManagePlan: boolean;
};

export type ProjectCreationLimitState = PlanUsageSummary & {
  canCreateProject: boolean;
  limitError: string | null;
};

function normalizeSubscriptionStatus(value: string | null | undefined): SubscriptionStatus {
  if (
    value === "free" ||
    value === "active" ||
    value === "trialing" ||
    value === "manual" ||
    value === "past_due" ||
    value === "canceled"
  ) {
    return value;
  }

  return "free";
}

function getOrganizationFromMembership(data: any) {
  return Array.isArray(data?.organizations) ? data.organizations[0] : data?.organizations;
}

export async function getNonArchivedProjectCount(supabase: any, organizationId: string) {
  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .neq("status", "archived");

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getOrganizationPlanUsageForMembership(supabase: any, profileId: string): Promise<OrganizationPlanUsage | null> {
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id,role,status,organizations(id,name,plan_tier,subscription_status)")
    .eq("profile_id", profileId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const organization = getOrganizationFromMembership(data);

  if (!data?.organization_id || !organization) {
    return null;
  }

  const activeProjectCount = await getNonArchivedProjectCount(supabase, data.organization_id);
  const summary = toPlanUsageSummary(organization.plan_tier, activeProjectCount);
  const membershipRole = data.role as OrganizationPlanUsage["membershipRole"];

  return {
    ...summary,
    organizationId: data.organization_id,
    organizationName: organization.name,
    subscriptionStatus: normalizeSubscriptionStatus(organization.subscription_status),
    membershipRole,
    canManagePlan: membershipRole === "owner" || membershipRole === "admin"
  };
}

export async function getProjectCreationLimitState(supabase: any, organizationId: string): Promise<ProjectCreationLimitState> {
  const [{ data: organization, error }, activeProjectCount] = await Promise.all([
    supabase.from("organizations").select("plan_tier").eq("id", organizationId).maybeSingle(),
    getNonArchivedProjectCount(supabase, organizationId)
  ]);

  if (error) {
    throw error;
  }

  const plan = getPlanDefinition(organization?.plan_tier as PlanTier | null | undefined);
  const summary = toPlanUsageSummary(plan.tier, activeProjectCount);
  const isLimitReached = isProjectLimitReached(plan.tier, activeProjectCount);

  return {
    ...summary,
    isLimitReached,
    canCreateProject: !isLimitReached,
    limitError: isLimitReached
      ? `${plan.name} allows ${plan.projectLimit} non-archived projects. Archive a completed project or upgrade the organization plan before creating another project.`
      : null
  };
}

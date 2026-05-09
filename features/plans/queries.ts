import "server-only";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { projects as demoProjects } from "@/features/projects/demo-data";
import { emptyWithError, type DataState } from "@/features/projects/errors";
import { toPlanUsageSummary } from "./constants";
import { getOrganizationPlanUsageForMembership, type OrganizationPlanUsage } from "./usage";

function getDemoPlanUsage(): OrganizationPlanUsage {
  const activeProjectCount = demoProjects.filter((project) => project.status !== "archived").length;

  return {
    ...toPlanUsageSummary("premium", activeProjectCount),
    organizationId: "demo-paladar",
    organizationName: "Paladar",
    subscriptionStatus: "manual",
    membershipRole: "owner",
    canManagePlan: true
  };
}

export async function getCurrentOrganizationPlanUsage(): Promise<DataState<OrganizationPlanUsage | null>> {
  if (!hasSupabaseEnv()) {
    return {
      data: getDemoPlanUsage(),
      error: "Supabase environment is not configured."
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      data: getDemoPlanUsage(),
      error: "Supabase environment is not configured."
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: "Sign in before viewing organization plan details."
    };
  }

  try {
    const usage = await getOrganizationPlanUsageForMembership(supabase as any, user.id);

    if (!usage) {
      return {
        data: null,
        error: "Your user needs an active organization membership before viewing plan details."
      };
    }

    return { data: usage, error: null };
  } catch (error) {
    return emptyWithError(null, error);
  }
}

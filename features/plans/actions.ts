"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const manualPlanChangeSchema = z.object({
  planTier: z.enum(["medium", "premium"])
});

async function getPlanManagementContext() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?status=env-missing");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/billing");
  }

  const { data: membership, error } = await (supabase as any)
    .from("organization_members")
    .select("organization_id,role,status")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    redirect(`/admin/billing?error=${encodeURIComponent("Unable to load your organization access.")}`);
  }

  if (!membership?.organization_id) {
    redirect(`/admin/billing?error=${encodeURIComponent("Your user needs an organization membership before managing plans.")}`);
  }

  if (membership.role !== "owner" && membership.role !== "admin") {
    redirect(`/admin/billing?error=${encodeURIComponent("Only organization owners and admins can change the plan placeholder.")}`);
  }

  return {
    supabase: supabase as any,
    organizationId: membership.organization_id as string
  };
}

export async function applyManualPlanChange(formData: FormData) {
  const parsed = manualPlanChangeSchema.safeParse({
    planTier: formData.get("planTier")
  });

  if (!parsed.success) {
    redirect(`/admin/billing?error=${encodeURIComponent("Choose a valid plan upgrade.")}`);
  }

  const { supabase, organizationId } = await getPlanManagementContext();

  // Temporary SaaS foundation only: real billing will replace this manual marker with provider-backed state.
  const { error } = await supabase
    .from("organizations")
    .update({
      plan_tier: parsed.data.planTier,
      subscription_status: "manual"
    })
    .eq("id", organizationId);

  if (error) {
    redirect(`/admin/billing?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/billing");
  revalidatePath("/admin/projects");
  redirect(`/admin/billing?updated=${parsed.data.planTier}`);
}

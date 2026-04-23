"use server";

import { redirect } from "next/navigation";
import { isBootstrapEmailAllowed } from "@/features/auth/access";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function claimFirstOwner() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?status=env-missing");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login?next=/admin/bootstrap");
  }

  if (!isBootstrapEmailAllowed(user.email)) {
    redirect("/admin/bootstrap?error=bootstrap-email-not-allowed");
  }

  const service = createSupabaseServiceRoleClient();

  const { count } = await service
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("user_type", "team")
    .eq("team_role", "owner");

  if ((count ?? 0) > 0) {
    redirect("/admin/bootstrap?error=owner-exists");
  }

  const { data: organization, error: organizationError } = await service
    .from("organizations")
    .upsert(
      {
        name: "Agency Workspace",
        slug: "agency-workspace"
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (organizationError) {
    redirect(`/admin/bootstrap?error=${encodeURIComponent(organizationError.message)}`);
  }

  const { error: profileError } = await service.from("profiles").upsert({
    id: user.id,
    email: user.email.toLowerCase(),
    full_name: user.user_metadata?.full_name ?? null,
    user_type: "team",
    team_role: "owner",
    organization_id: organization.id
  });

  if (profileError) {
    redirect(`/admin/bootstrap?error=${encodeURIComponent(profileError.message)}`);
  }

  redirect("/admin?bootstrapped=1");
}

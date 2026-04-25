import { redirect } from "next/navigation";
import { completeAgencyRegistrationForUser } from "@/features/auth/registration";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function RegisterCompletePage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/register?status=env-missing");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login?next=/register/complete");
  }

  await completeAgencyRegistrationForUser({
    userId: user.id,
    email: user.email,
    fullName: user.user_metadata?.full_name ?? null
  });

  return null;
}

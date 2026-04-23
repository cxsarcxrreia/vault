import { NextResponse, type NextRequest } from "next/server";
import { hasTeamOwner, isBootstrapEmailAllowed, resolvePostLoginPath } from "@/features/auth/access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/portal";
  const authError = requestUrl.searchParams.get("error_code") ?? requestUrl.searchParams.get("error");

  if (authError) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", authError);
    loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.exchangeCodeForSession(code);

    const {
      data: { user }
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    if (user?.email && next.startsWith("/admin/bootstrap") && !(await hasTeamOwner()) && isBootstrapEmailAllowed(user.email)) {
      return NextResponse.redirect(new URL("/admin/bootstrap", requestUrl.origin));
    }

    const { data: profile } = user
      ? await supabase!
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()
      : { data: null };

    const resolvedNext = await resolvePostLoginPath(next, profile);
    return NextResponse.redirect(new URL(resolvedNext, requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

import { NextResponse, type NextRequest } from "next/server";
import { hasTeamOwner, isBootstrapEmailAllowed, resolvePostLoginPath } from "@/features/auth/access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeRelativePath(path: string | null, fallback = "/portal") {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  return path;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const appUrl = requestUrl.origin;

  const code = requestUrl.searchParams.get("code");
  const next = safeRelativePath(requestUrl.searchParams.get("next"), "/portal");
  const authError = requestUrl.searchParams.get("error_code") ?? requestUrl.searchParams.get("error");

  if (authError) {
    const loginUrl = new URL("/login", appUrl);
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

    if (
      user?.email &&
      next.startsWith("/admin/bootstrap") &&
      !(await hasTeamOwner()) &&
      isBootstrapEmailAllowed(user.email)
    ) {
      return NextResponse.redirect(new URL("/admin/bootstrap", appUrl));
    }

    if (user?.email && next.startsWith("/register/complete")) {
      return NextResponse.redirect(new URL("/register/complete", appUrl));
    }

    const { data: profile } = user
      ? await supabase!
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()
      : { data: null };

    const resolvedNext = safeRelativePath(await resolvePostLoginPath(next, profile), "/portal");

    return NextResponse.redirect(new URL(resolvedNext, appUrl));
  }

  return NextResponse.redirect(new URL(next, appUrl));
}

import { NextResponse, type NextRequest } from "next/server";
import { resolvePostLoginPath } from "@/features/auth/access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const appUrl = requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const authError = requestUrl.searchParams.get("error_code") ?? requestUrl.searchParams.get("error");

  if (authError) {
    const loginUrl = new URL("/login", appUrl);
    loginUrl.searchParams.set("error", authError);
    loginUrl.searchParams.set("next", "/admin");
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing-auth-code&next=/admin", appUrl));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/login?status=env-missing&next=/admin", appUrl));
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const loginUrl = new URL("/login", appUrl);
    loginUrl.searchParams.set("error", exchangeError.code ?? exchangeError.message);
    loginUrl.searchParams.set("next", "/admin");
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const nextPath = await resolvePostLoginPath("/admin", profile);
  return NextResponse.redirect(new URL(nextPath, appUrl));
}

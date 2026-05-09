import { NextResponse, type NextRequest } from "next/server";
import { completeAgencyRegistration } from "@/features/auth/registration";
import { getCanonicalAppUrl } from "@/lib/app-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const appUrl = getCanonicalAppUrl();
  const code = requestUrl.searchParams.get("code");
  const authError = requestUrl.searchParams.get("error_code") ?? requestUrl.searchParams.get("error");

  if (authError) {
    const registerUrl = new URL("/register", appUrl);
    registerUrl.searchParams.set("error", authError);
    return NextResponse.redirect(registerUrl);
  }

  if (!code) {
    return NextResponse.redirect(new URL("/register?error=missing-auth-code", appUrl));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/register?status=env-missing", appUrl));
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const registerUrl = new URL("/register", appUrl);
    registerUrl.searchParams.set("error", exchangeError.code ?? exchangeError.message);
    return NextResponse.redirect(registerUrl);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(new URL("/login?next=/register/complete", appUrl));
  }

  const nextPath = await completeAgencyRegistration({
    userId: user.id,
    email: user.email,
    fullName: user.user_metadata?.full_name ?? null
  });

  return NextResponse.redirect(new URL(nextPath, appUrl));
}

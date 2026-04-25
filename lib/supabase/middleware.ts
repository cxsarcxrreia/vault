import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { hasSupabaseEnv } from "./env";

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const protectedPath = request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/portal");

  if (protectedPath && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/bootstrap")) {
    const { count } = await (supabase as any)
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .eq("status", "active");

    if ((count ?? 0) === 0) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      loginUrl.searchParams.set("error", "admin-access-required");
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (user && request.nextUrl.pathname.startsWith("/portal")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id,user_type,team_role,organization_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.user_type === "team" && profile.team_role && profile.organization_id) {
      const { count } = await (supabase as any)
        .from("organization_members")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", user.id)
        .eq("status", "active");

      if ((count ?? 0) > 0) {
        return response;
      }
    }

    if (profile?.user_type === "client") {
      const { count } = await supabase
        .from("client_users")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", user.id);

      if ((count ?? 0) > 0) {
        return response;
      }
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("error", "client-access-required");
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

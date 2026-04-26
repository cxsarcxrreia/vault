"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { resolveLoginAccess } from "@/features/auth/access";
import { buildRequestSignInCallbackUrl, getCanonicalAppUrl, isLocalAppUrl } from "@/lib/app-url";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email(),
  next: z.string().default("/")
});

export async function sendMagicLink(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") || "/"
  });

  if (!parsed.success) {
    redirect("/login?error=invalid-email");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?status=env-missing");
  }

  const access = await resolveLoginAccess(parsed.data.email, parsed.data.next);

  if (!access.allowed) {
    redirect(`/login?error=${encodeURIComponent(access.reason ?? "access-not-enabled")}`);
  }

  const redirectTo = await buildRequestSignInCallbackUrl(access.next);

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: false
    }
  });

  if (error) {
    const code = error.code ?? error.status?.toString() ?? "magic-link";
    redirect(`/login?error=${encodeURIComponent(code)}`);
  }

  redirect("/login?status=check-email");
}

export async function createDevSignInLink(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") || "/"
  });

  if (!parsed.success) {
    redirect("/login?error=invalid-email");
  }

  const appUrl = getCanonicalAppUrl();
  const isLocalApp = isLocalAppUrl(appUrl);

  if (process.env.NODE_ENV === "production" || !isLocalApp) {
    redirect("/login?error=dev-link-disabled");
  }

  const service = createSupabaseServiceRoleClient();
  const access = await resolveLoginAccess(parsed.data.email, parsed.data.next);

  if (!access.allowed) {
    redirect(`/login?error=${encodeURIComponent(access.reason ?? "access-not-enabled")}`);
  }

  const redirectTo = await buildRequestSignInCallbackUrl(access.next);

  const firstAttempt = await service.auth.admin.generateLink({
    type: "magiclink",
    email: parsed.data.email,
    options: {
      redirectTo
    }
  });

  if (firstAttempt.error) {
    const { error: createUserError } = await service.auth.admin.createUser({
      email: parsed.data.email,
      email_confirm: true
    });

    if (createUserError && createUserError.code !== "email_exists") {
      const code = createUserError.code ?? createUserError.status?.toString() ?? "dev-create-user";
      redirect(`/login?error=${encodeURIComponent(code)}`);
    }
  }

  const finalAttempt = firstAttempt.error
    ? await service.auth.admin.generateLink({
        type: "magiclink",
        email: parsed.data.email,
        options: {
          redirectTo
        }
      })
    : firstAttempt;

  const actionLink = finalAttempt.data.properties?.action_link;

  if (finalAttempt.error || !actionLink) {
    const code = finalAttempt.error?.code ?? finalAttempt.error?.status?.toString() ?? "dev-link";
    redirect(`/login?error=${encodeURIComponent(code)}`);
  }

  redirect(actionLink);
}

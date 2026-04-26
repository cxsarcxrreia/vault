"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ensureAuthUser, findAuthUserIdByEmail } from "@/features/auth/access";
import { buildAgencyRegistrationCallbackUrl, getCanonicalAppUrl, isLocalAppUrl } from "@/lib/app-url";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const registrationSchema = z.object({
  agencyName: z.string().min(2).max(120),
  ownerName: z.string().max(120).optional(),
  ownerEmail: z.string().email()
});

const pendingRegistrationSchema = z.object({
  ownerEmail: z.string().email()
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function prepareAgencyRegistration(formData: FormData) {
  const parsed = registrationSchema.safeParse({
    agencyName: formData.get("agencyName"),
    ownerName: formData.get("ownerName") || undefined,
    ownerEmail: formData.get("ownerEmail")
  });

  if (!parsed.success) {
    redirect("/register?error=invalid-registration");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/register?status=env-missing");
  }

  const service = createSupabaseServiceRoleClient() as any;
  const ownerEmail = normalizeEmail(parsed.data.ownerEmail);
  const existingUserId = await findAuthUserIdByEmail(ownerEmail);

  if (existingUserId) {
    const { count: membershipCount, error: membershipError } = await service
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", existingUserId)
      .eq("status", "active");

    if (membershipError && !["42P01", "PGRST200", "PGRST205"].includes(membershipError.code)) {
      redirect(`/register?error=${encodeURIComponent(membershipError.message)}`);
    }

    if ((membershipCount ?? 0) > 0) {
      redirect("/register?error=email-already-has-agency");
    }
  }

  const { count: updatedCount, error: updateError } = await service
    .from("agency_registrations")
    .update({
      agency_name: parsed.data.agencyName,
      owner_name: parsed.data.ownerName || null,
      owner_email: ownerEmail
    }, { count: "exact" })
    .eq("owner_email_normalized", ownerEmail)
    .eq("status", "pending");

  if (updateError && !["42P01", "PGRST200", "PGRST205"].includes(updateError.code)) {
    redirect(`/register?error=${encodeURIComponent(updateError.message)}`);
  }

  if ((updatedCount ?? 0) === 0) {
    const { error: insertError } = await service.from("agency_registrations").insert({
      agency_name: parsed.data.agencyName,
      owner_name: parsed.data.ownerName || null,
      owner_email: ownerEmail,
      status: "pending"
    });

    if (insertError) {
      redirect(`/register?error=${encodeURIComponent(insertError.message)}`);
    }
  }

  return { ownerEmail };
}

export async function startAgencyRegistration(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/register?status=env-missing");
  }

  const { ownerEmail } = await prepareAgencyRegistration(formData);
  await ensureAuthUser(ownerEmail);

  const { error } = await supabase.auth.signInWithOtp({
    email: ownerEmail,
    options: {
      emailRedirectTo: buildAgencyRegistrationCallbackUrl(),
      shouldCreateUser: false
    }
  });

  if (error) {
    const code = error.code ?? error.status?.toString() ?? "magic-link";
    redirect(`/register?error=${encodeURIComponent(code)}`);
  }

  redirect("/register?status=check-email");
}

export async function createDevAgencyRegistrationLink(formData: FormData) {
  const appUrl = getCanonicalAppUrl();
  const isLocalApp = isLocalAppUrl(appUrl);

  if (process.env.NODE_ENV === "production" || !isLocalApp) {
    redirect("/register?error=dev-link-disabled");
  }

  const service = createSupabaseServiceRoleClient();
  const { ownerEmail } = await prepareAgencyRegistration(formData);
  await ensureAuthUser(ownerEmail);
  const redirectTo = buildAgencyRegistrationCallbackUrl();
  const { data, error } = await service.auth.admin.generateLink({
    type: "magiclink",
    email: ownerEmail,
    options: {
      redirectTo
    }
  });

  const actionLink = data.properties?.action_link;

  if (error || !actionLink) {
    const code = error?.code ?? error?.status?.toString() ?? "dev-link";
    redirect(`/register?error=${encodeURIComponent(code)}`);
  }

  redirect(actionLink);
}

export async function createDevPendingRegistrationLink(formData: FormData) {
  const appUrl = getCanonicalAppUrl();
  const isLocalApp = isLocalAppUrl(appUrl);

  if (process.env.NODE_ENV === "production" || !isLocalApp) {
    redirect("/register?error=dev-link-disabled");
  }

  const parsed = pendingRegistrationSchema.safeParse({
    ownerEmail: formData.get("ownerEmail")
  });

  if (!parsed.success) {
    redirect("/register?error=invalid-email");
  }

  const service = createSupabaseServiceRoleClient() as any;
  const ownerEmail = normalizeEmail(parsed.data.ownerEmail);
  const existingUserId = await ensureAuthUser(ownerEmail);

  const { count: registrationCount, error: registrationError } = await service
    .from("agency_registrations")
    .select("id", { count: "exact", head: true })
    .eq("owner_email_normalized", ownerEmail)
    .eq("status", "pending");

  if (registrationError) {
    redirect(`/register?error=${encodeURIComponent(registrationError.message)}`);
  }

  if ((registrationCount ?? 0) === 0) {
    redirect("/register?error=registration-not-found");
  }

  const { count: membershipCount, error: membershipError } = await service
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", existingUserId)
    .eq("status", "active");

  if (membershipError && !["42P01", "PGRST200", "PGRST205"].includes(membershipError.code)) {
    redirect(`/register?error=${encodeURIComponent(membershipError.message)}`);
  }

  if ((membershipCount ?? 0) > 0) {
    redirect("/register?error=email-already-has-agency");
  }

  const redirectTo = buildAgencyRegistrationCallbackUrl();
  const { data, error } = await service.auth.admin.generateLink({
    type: "magiclink",
    email: ownerEmail,
    options: {
      redirectTo
    }
  });

  const actionLink = data.properties?.action_link;

  if (error || !actionLink) {
    const code = error?.code ?? error?.status?.toString() ?? "dev-link";
    redirect(`/register?error=${encodeURIComponent(code)}`);
  }

  redirect(actionLink);
}

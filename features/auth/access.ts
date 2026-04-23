import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type AccessInvitation = Database["public"]["Tables"]["access_invitations"]["Row"];
type TeamRole = Database["public"]["Enums"]["team_role"];
type ClientRole = Database["public"]["Enums"]["client_role"];
type UserType = Database["public"]["Enums"]["user_type"];

type AccessDecision = {
  allowed: boolean;
  next: string;
  reason?: string;
};

const DEFAULT_PORTAL_PATH = "/portal";
const DEFAULT_ADMIN_PATH = "/admin";
const BOOTSTRAP_PATH = "/admin/bootstrap";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sanitizeNext(next: string) {
  if (!next.startsWith("/") || next.startsWith("//")) {
    return DEFAULT_PORTAL_PATH;
  }

  return next;
}

function isLocalDevelopment() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return process.env.NODE_ENV !== "production" && (appUrl.includes("localhost") || appUrl.includes("127.0.0.1"));
}

export function getBootstrapOwnerEmails() {
  return (process.env.ADMIN_BOOTSTRAP_EMAILS ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

export function isBootstrapEmailAllowed(email: string) {
  const allowedEmails = getBootstrapOwnerEmails();

  if (allowedEmails.length > 0) {
    return allowedEmails.includes(normalizeEmail(email));
  }

  return isLocalDevelopment();
}

export async function hasTeamOwner() {
  const service = createSupabaseServiceRoleClient();
  const { count, error } = await service
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("user_type", "team")
    .eq("team_role", "owner");

  if (error) {
    throw error;
  }

  return (count ?? 0) > 0;
}

async function findProfileByEmail(email: string): Promise<Profile | null> {
  const service = createSupabaseServiceRoleClient();
  const { data, error } = await service
    .from("profiles")
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function hasClientMembership(profileId: string) {
  const service = createSupabaseServiceRoleClient();
  const { count, error } = await service
    .from("client_users")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId);

  if (error) {
    throw error;
  }

  return (count ?? 0) > 0;
}

async function getPendingInvitation(email: string): Promise<AccessInvitation | null> {
  const service = createSupabaseServiceRoleClient();
  const now = new Date().toISOString();
  const { data, error } = await service
    .from("access_invitations")
    .select("*")
    .eq("email_normalized", normalizeEmail(email))
    .eq("status", "pending")
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && !["42P01", "PGRST200", "PGRST205"].includes(error.code)) {
    throw error;
  }

  return data ?? null;
}

async function findAuthUserIdByEmail(email: string) {
  const service = createSupabaseServiceRoleClient();
  const normalized = normalizeEmail(email);
  let page = 1;

  while (page <= 10) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 1000 });

    if (error) {
      throw error;
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === normalized);

    if (user) {
      return user.id;
    }

    if (data.users.length < 1000) {
      break;
    }

    page += 1;
  }

  return null;
}

export async function ensureAuthUser(email: string) {
  const service = createSupabaseServiceRoleClient();
  const existingId = await findAuthUserIdByEmail(email);

  if (existingId) {
    return existingId;
  }

  const { data, error } = await service.auth.admin.createUser({
    email: normalizeEmail(email),
    email_confirm: true
  });

  if (error) {
    throw error;
  }

  return data.user.id;
}

export async function upsertProfile(input: {
  profileId: string;
  email: string;
  userType: UserType;
  organizationId: string | null;
  teamRole?: TeamRole | null;
}) {
  const service = createSupabaseServiceRoleClient();
  const { error } = await service.from("profiles").upsert({
    id: input.profileId,
    email: normalizeEmail(input.email),
    user_type: input.userType,
    organization_id: input.organizationId,
    team_role: input.teamRole ?? null
  });

  if (error) {
    throw error;
  }
}

export async function ensureClientMembership(input: {
  email: string;
  clientId: string;
  organizationId: string;
  role?: ClientRole;
}) {
  const profileId = await ensureAuthUser(input.email);
  await upsertProfile({
    profileId,
    email: input.email,
    userType: "client",
    organizationId: input.organizationId,
    teamRole: null
  });

  const service = createSupabaseServiceRoleClient();
  const { error } = await service.from("client_users").upsert({
    client_id: input.clientId,
    profile_id: profileId,
    role: input.role ?? "client_owner"
  });

  if (error) {
    throw error;
  }

  return profileId;
}

async function acceptInvitation(invitation: AccessInvitation) {
  const profileId = await ensureAuthUser(invitation.email);

  if (invitation.user_type === "team") {
    await upsertProfile({
      profileId,
      email: invitation.email,
      userType: "team",
      organizationId: invitation.organization_id,
      teamRole: invitation.team_role
    });
  } else {
    if (!invitation.client_id || !invitation.organization_id) {
      return;
    }

    await ensureClientMembership({
      email: invitation.email,
      clientId: invitation.client_id,
      organizationId: invitation.organization_id,
      role: invitation.client_role ?? "client_collaborator"
    });
  }

  const service = createSupabaseServiceRoleClient();
  await service
    .from("access_invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);
}

export async function resolveLoginAccess(email: string, requestedNext: string): Promise<AccessDecision> {
  const next = sanitizeNext(requestedNext);
  const normalized = normalizeEmail(email);
  const ownerExists = await hasTeamOwner();

  if (!ownerExists && next.startsWith(BOOTSTRAP_PATH)) {
    if (!isBootstrapEmailAllowed(normalized)) {
      return { allowed: false, next: BOOTSTRAP_PATH, reason: "bootstrap-email-not-allowed" };
    }

    await ensureAuthUser(normalized);
    return { allowed: true, next: BOOTSTRAP_PATH };
  }

  const invitation = await getPendingInvitation(normalized);

  if (invitation) {
    await acceptInvitation(invitation);
  }

  const profile = await findProfileByEmail(normalized);

  if (!profile) {
    return { allowed: false, next, reason: "not-invited" };
  }

  if (profile.user_type === "team") {
    if (!profile.organization_id || !profile.team_role) {
      return { allowed: false, next, reason: "team-profile-incomplete" };
    }

    return { allowed: true, next: next.startsWith("/admin") ? next : DEFAULT_ADMIN_PATH };
  }

  if (await hasClientMembership(profile.id)) {
    return { allowed: true, next: next.startsWith("/portal") ? next : DEFAULT_PORTAL_PATH };
  }

  return { allowed: false, next, reason: "client-membership-required" };
}

export async function resolvePostLoginPath(requestedNext: string, profile: Profile | null) {
  const next = sanitizeNext(requestedNext);

  if (!profile) {
    return DEFAULT_PORTAL_PATH;
  }

  if (profile.user_type === "team" && profile.organization_id && profile.team_role) {
    return next.startsWith("/admin") || next.startsWith("/portal") ? next : DEFAULT_ADMIN_PATH;
  }

  if (profile.user_type === "client" && (await hasClientMembership(profile.id))) {
    return next.startsWith("/portal") ? next : DEFAULT_PORTAL_PATH;
  }

  return "/login?error=access-not-enabled";
}

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv(file) {
  const fullPath = path.join(process.cwd(), file);

  if (!fs.existsSync(fullPath)) {
    return {};
  }

  return Object.fromEntries(
    fs
      .readFileSync(fullPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const env = { ...loadEnv(".env.local"), ...process.env };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

assert(url && anonKey && serviceRoleKey, "Supabase env vars are required.");

const service = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const runId = Date.now();
const email = `revision-test-${runId}@example.com`;
const password = `Revision-test-${runId}!`;
let userId;
let organizationId;

try {
  const { data: userData, error: userError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  assert(!userError, userError?.message ?? "Unable to create test user.");
  userId = userData.user.id;

  const { data: organization, error: organizationError } = await service
    .from("organizations")
    .insert({ name: `Revision Test ${runId}`, slug: `revision-test-${runId}` })
    .select("id")
    .single();
  assert(!organizationError, organizationError?.message ?? "Unable to create organization.");
  organizationId = organization.id;

  await service.from("profiles").upsert({
    id: userId,
    organization_id: organizationId,
    email,
    user_type: "client",
    team_role: null
  });

  const { data: client, error: clientError } = await service
    .from("clients")
    .insert({
      organization_id: organizationId,
      name: "Revision Test Client",
      primary_contact_email: email,
      status: "active"
    })
    .select("id")
    .single();
  assert(!clientError, clientError?.message ?? "Unable to create client.");

  const { error: membershipError } = await service.from("client_users").insert({
    client_id: client.id,
    profile_id: userId,
    role: "client_owner"
  });
  assert(!membershipError, membershipError?.message ?? "Unable to create client membership.");

  const { data: project, error: projectError } = await service
    .from("projects")
    .insert({
      organization_id: organizationId,
      client_id: client.id,
      name: "Revision Test Project",
      status: "active",
      pre_activation_status: "payment_confirmed",
      activation_state: "activated"
    })
    .select("id")
    .single();
  assert(!projectError, projectError?.message ?? "Unable to create project.");

  const { data: deliverable, error: deliverableError } = await service
    .from("deliverables")
    .insert({
      project_id: project.id,
      title: "Revision Test Deliverable",
      deliverable_type: "Test",
      status: "ready_for_review",
      revision_limit: 2,
      revisions_remaining: 2,
      external_url: "https://drive.google.com/test"
    })
    .select("id")
    .single();
  assert(!deliverableError, deliverableError?.message ?? "Unable to create deliverable.");

  const clientSession = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error: signInError } = await clientSession.auth.signInWithPassword({ email, password });
  assert(!signInError, signInError?.message ?? "Unable to sign in test client.");

  const firstRevision = await clientSession.rpc("request_deliverable_revision", {
    target_deliverable_id: deliverable.id,
    comment_body: "Please revise the intro."
  });
  assert(!firstRevision.error, firstRevision.error?.message ?? "First revision request failed.");

  const { data: afterRevision } = await service
    .from("deliverables")
    .select("status,revisions_remaining")
    .eq("id", deliverable.id)
    .single();
  assert(afterRevision.status === "revision_requested", "Revision request did not set status.");
  assert(afterRevision.revisions_remaining === 1, "Revision request did not decrement revisions.");

  const duplicateRevision = await clientSession.rpc("request_deliverable_revision", {
    target_deliverable_id: deliverable.id,
    comment_body: "Second request while pending."
  });
  assert(duplicateRevision.error, "Duplicate pending revision request should be blocked.");

  const approvePending = await clientSession.rpc("approve_deliverable_as_client", {
    target_deliverable_id: deliverable.id
  });
  assert(approvePending.error, "Approval should be blocked while revision is pending.");

  await service.from("deliverables").update({ status: "ready_for_review" }).eq("id", deliverable.id);

  const approveAfterResubmission = await clientSession.rpc("approve_deliverable_as_client", {
    target_deliverable_id: deliverable.id
  });
  assert(!approveAfterResubmission.error, approveAfterResubmission.error?.message ?? "Approval after resubmission failed.");

  const { data: afterApproval } = await service
    .from("deliverables")
    .select("status,revisions_remaining")
    .eq("id", deliverable.id)
    .single();
  assert(afterApproval.status === "approved", "Approval did not set approved status.");
  assert(afterApproval.revisions_remaining === 1, "Approval should not change remaining revisions.");

  await service.from("deliverables").update({ status: "ready_for_review", revisions_remaining: 0 }).eq("id", deliverable.id);

  const noRevisions = await clientSession.rpc("request_deliverable_revision", {
    target_deliverable_id: deliverable.id,
    comment_body: "No revisions left."
  });
  assert(noRevisions.error, "Revision request with zero remaining should be blocked.");

  console.log("REVISION_FLOW_CHECK: ok");
} finally {
  if (organizationId) {
    await service.from("organizations").delete().eq("id", organizationId);
  }

  if (userId) {
    await service.auth.admin.deleteUser(userId);
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";

const tokenSchema = z.string().uuid();

export async function approveProposal(formData: FormData) {
  const token = tokenSchema.parse(formData.get("token"));
  const proposalPath = `/proposal/${token}`;
  let supabase: ReturnType<typeof createSupabaseServiceRoleClient>;

  try {
    supabase = createSupabaseServiceRoleClient();
  } catch {
    redirect(`${proposalPath}?error=${encodeURIComponent("Proposal review is not configured yet.")}`);
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id,status,pre_activation_status,activation_state,proposal_approved_at,client_id,clients(primary_contact_email)")
    .eq("proposal_token", token)
    .maybeSingle();

  if (projectError || !project) {
    redirect(`${proposalPath}?error=${encodeURIComponent("This proposal link is not available.")}`);
  }

  if (
    project.proposal_approved_at ||
    project.pre_activation_status === "proposal_approved" ||
    project.activation_state === "proposal_approved"
  ) {
    redirect(`${proposalPath}?updated=already-approved`);
  }

  if (
    project.status !== "proposal_sent" ||
    project.pre_activation_status !== "proposal_sent" ||
    project.activation_state !== "internal_draft"
  ) {
    redirect(`${proposalPath}?error=${encodeURIComponent("This proposal is not open for approval.")}`);
  }

  const client = Array.isArray(project.clients) ? project.clients[0] : project.clients;
  const approvedByEmail = client?.primary_contact_email ?? null;

  const { error } = await supabase
    .from("projects")
    .update({
      pre_activation_status: "proposal_approved",
      activation_state: "proposal_approved",
      status: "draft",
      proposal_approved_at: new Date().toISOString(),
      proposal_approved_by_email: approvedByEmail
    })
    .eq("id", project.id);

  if (error) {
    redirect(`${proposalPath}?error=${encodeURIComponent("Unable to approve this proposal.")}`);
  }

  revalidatePath(proposalPath);
  revalidatePath(`/admin/projects/${project.id}`);
  redirect(`${proposalPath}?updated=approved`);
}

import { AppWorkspace, WorkspaceHeader } from "@/components/layout/app-workspace";
import { FormMessage } from "@/components/shared/form-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { isBootstrapEmailAllowed } from "@/features/auth/access";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { claimFirstOwner } from "./actions";

type BootstrapPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BootstrapPage({ searchParams }: BootstrapPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = typeof params.error === "string" ? params.error : null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  const service = createSupabaseServiceRoleClient();
  const { count } = await (service as any)
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("role", "owner")
    .eq("status", "active");

  const ownerExists = (count ?? 0) > 0;
  const bootstrapEmailAllowed = Boolean(user?.email && isBootstrapEmailAllowed(user.email));

  return (
    <AppWorkspace width="narrow">
      <WorkspaceHeader
        label="Setup"
        title="Claim Paladar owner"
        meta="One-time owner claim after the first magic-link sign-in."
      />
      <div>
        <Card className="max-w-xl rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <h2 className="font-semibold">Initial team setup</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This page is intentionally small and locks itself once a team owner exists.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? <FormMessage type="error">{error.replaceAll("-", " ")}</FormMessage> : null}
            {!user ? <FormMessage type="error">Sign in first, then return to this setup page.</FormMessage> : null}
            {ownerExists ? (
              <FormMessage type="info">A team owner already exists. Continue to the admin panel.</FormMessage>
            ) : user && !bootstrapEmailAllowed ? (
              <FormMessage type="error">This email is not allowed to claim the first owner account.</FormMessage>
            ) : (
              <form action={claimFirstOwner}>
                <Button type="submit" disabled={!user || !bootstrapEmailAllowed}>
                  Claim owner access
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppWorkspace>
  );
}

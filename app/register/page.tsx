import { Building2, Mail } from "lucide-react";
import Link from "next/link";
import { FormMessage } from "@/components/shared/form-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { startAgencyRegistration } from "./actions";

type RegisterPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = searchParams ? await searchParams : {};
  const status = typeof params.status === "string" ? params.status : null;
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Link href="/" className="text-sm font-semibold">
              VAULT
            </Link>
            <h1 className="mt-6 text-3xl font-semibold tracking-normal md:text-5xl">Create your agency workspace</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Start with a clean operations layer for client projects, deliverables, approvals, documents, and responsibilities.
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-muted">
                  <Building2 className="size-5 text-muted-foreground" />
                </span>
                <div>
                  <h2 className="font-semibold">Agency details</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Your email becomes the first owner account.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {status === "check-email" ? (
                <FormMessage type="success">Check your inbox for a sign-in link to finish creating the agency.</FormMessage>
              ) : null}
              {status === "env-missing" ? <FormMessage type="error">Supabase env vars are not configured yet.</FormMessage> : null}
              {error === "invalid-registration" ? <FormMessage type="error">Check the agency name and owner email.</FormMessage> : null}
              {error === "email-already-has-agency" ? (
                <FormMessage type="error">This email already belongs to an agency workspace. Sign in instead.</FormMessage>
              ) : null}
              {error === "registration-not-found" ? (
                <FormMessage type="error">Start registration again so the workspace can be created.</FormMessage>
              ) : null}
              {error && !["invalid-registration", "email-already-has-agency", "registration-not-found"].includes(error) ? (
                <FormMessage type="error">Unable to continue: {error}</FormMessage>
              ) : null}

              <form action={startAgencyRegistration} className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Agency name</span>
                  <input
                    required
                    name="agencyName"
                    placeholder="Paladar"
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/10"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Owner name</span>
                  <input
                    name="ownerName"
                    placeholder="Your name"
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/10"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Owner email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      required
                      name="ownerEmail"
                      type="email"
                      placeholder="owner@agency.com"
                      className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-foreground/10"
                    />
                  </div>
                </label>
                <Button type="submit" className="w-full">
                  Create agency
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                Already have access?{" "}
                <Link href="/login?next=/admin" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

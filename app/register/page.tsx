import { Building2, Mail } from "lucide-react";
import Link from "next/link";
import { PublicHeader, PublicNav, PublicPage, PublicPanel, PublicWorkspace } from "@/components/layout/public-shell";
import { FormMessage } from "@/components/shared/form-message";
import { Button } from "@/components/ui/button";
import { getCanonicalAppUrl, isLocalAppUrl } from "@/lib/app-url";
import { createDevAgencyRegistrationLink, createDevPendingRegistrationLink, startAgencyRegistration } from "./actions";

type RegisterPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = searchParams ? await searchParams : {};
  const status = typeof params.status === "string" ? params.status : null;
  const error = typeof params.error === "string" ? params.error : null;
  const appUrl = getCanonicalAppUrl();
  const showDevLink = process.env.NODE_ENV !== "production" && isLocalAppUrl(appUrl);

  return (
    <PublicPage>
      <PublicNav
        actions={
          <Link href="/login" className="rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900">
            Sign in
          </Link>
        }
      />
      <PublicWorkspace width="wide" className="grid min-h-[calc(100vh-5rem)] items-center py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1fr] lg:items-center">
          <PublicHeader
            label="Agency setup"
            title="Create your agency workspace"
            description="Start with a clean operations layer for client projects, deliverables, approvals, documents, and responsibilities."
          />

          <PublicPanel className="p-0">
            <div className="flex items-center gap-3 border-b border-neutral-200 p-5">
              <span className="grid size-10 place-items-center rounded-lg bg-neutral-100">
                <Building2 className="size-5 text-neutral-500" />
              </span>
              <div>
                <h2 className="text-[15px] font-semibold text-neutral-900">Agency details</h2>
                <p className="mt-1 text-[13px] text-neutral-500">Your email becomes the first owner account.</p>
              </div>
            </div>
            <div className="space-y-4 p-5">
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
              {error === "over_email_send_rate_limit" || error === "429" ? (
                <FormMessage type="warning">
                  Supabase rate-limited email sending for this project. The registration was saved; use local dev continue below or wait before trying email again.
                </FormMessage>
              ) : null}
              {error === "dev-link-disabled" ? (
                <FormMessage type="error">Local dev continue is disabled outside localhost development.</FormMessage>
              ) : null}
              {error && !["invalid-registration", "email-already-has-agency", "registration-not-found", "over_email_send_rate_limit", "429", "dev-link-disabled"].includes(error) ? (
                <FormMessage type="error">Unable to continue: {error}</FormMessage>
              ) : null}

              <form action={startAgencyRegistration} className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-[13px] font-medium text-neutral-800">Agency name</span>
                  <input
                    required
                    name="agencyName"
                    placeholder="Paladar"
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] outline-none transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-[13px] font-medium text-neutral-800">Owner name</span>
                  <input
                    name="ownerName"
                    placeholder="Your name"
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] outline-none transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-[13px] font-medium text-neutral-800">Owner email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      required
                      name="ownerEmail"
                      type="email"
                      placeholder="owner@agency.com"
                      className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-[13px] outline-none transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </div>
                </label>
                <Button type="submit" className="w-full rounded-lg text-[13px]">
                  Create agency
                </Button>
                {showDevLink ? (
                  <Button formAction={createDevAgencyRegistrationLink} type="submit" variant="outline" className="w-full rounded-lg text-[13px]">
                    Continue locally without email
                  </Button>
                ) : null}
              </form>
              {showDevLink && (error === "over_email_send_rate_limit" || error === "429") ? (
                <form action={createDevPendingRegistrationLink} className="space-y-3 border-t border-neutral-200 pt-4">
                  <label className="block space-y-2">
                    <span className="text-[13px] font-medium text-neutral-800">Pending owner email</span>
                    <input
                      required
                      name="ownerEmail"
                      type="email"
                      placeholder="owner@agency.com"
                      className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] outline-none transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </label>
                  <Button type="submit" variant="outline" className="w-full rounded-lg text-[13px]">
                    Continue pending registration
                  </Button>
                </form>
              ) : null}
              <p className="text-center text-[13px] text-neutral-500">
                Already have access?{" "}
                <Link href="/login" className="font-medium text-neutral-900 underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </PublicPanel>
        </div>
      </PublicWorkspace>
    </PublicPage>
  );
}

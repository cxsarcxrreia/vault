import { Mail } from "lucide-react";
import Link from "next/link";
import { PublicHeader, PublicNav, PublicPage, PublicPanel, PublicWorkspace } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { getCanonicalAppUrl, isLocalAppUrl } from "@/lib/app-url";
import { createDevSignInLink, sendMagicLink } from "./actions";
import { HashSessionHandler } from "./hash-session-handler";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const status = typeof params.status === "string" ? params.status : null;
  const error = typeof params.error === "string" ? params.error : null;
  const next = typeof params.next === "string" ? params.next : "/";
  const appUrl = getCanonicalAppUrl();
  const showDevLink = process.env.NODE_ENV !== "production" && isLocalAppUrl(appUrl);

  return (
    <PublicPage>
      <PublicNav
        actions={
          <Link href="/register" className="rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900">
            Create agency
          </Link>
        }
      />
      <PublicWorkspace width="wide" className="grid min-h-[calc(100vh-5rem)] items-center py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1fr] lg:items-center">
          <PublicHeader
            label="Secure access"
            title="Sign in by email"
            description="Use the email connected to your agency workspace or client portal."
          />
          <PublicPanel className="p-0">
            <div className="flex items-center gap-3 border-b border-neutral-200 p-5">
              <span className="grid size-10 place-items-center rounded-lg bg-neutral-100">
                <Mail className="size-5 text-neutral-500" />
              </span>
              <div>
                <h2 className="text-[15px] font-semibold text-neutral-900">Magic link</h2>
                <p className="mt-1 text-[13px] text-neutral-500">No password required.</p>
              </div>
            </div>
            <div className="p-5">
              <HashSessionHandler next={next} />
              <form action={sendMagicLink} className="space-y-4">
                <input type="hidden" name="next" value={next} />
                <label className="block space-y-2">
                  <span className="text-[13px] font-medium text-neutral-800">Email</span>
                  <input
                    required
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] outline-none transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10"
                  />
                </label>
                <Button className="w-full rounded-lg text-[13px]" type="submit">
                  Send magic link
                </Button>
              </form>
              {showDevLink ? (
                <form action={createDevSignInLink} className="mt-4 space-y-3 border-t border-neutral-200 pt-4">
                  <input type="hidden" name="next" value={next} />
                  <label className="block space-y-2">
                    <span className="text-[13px] font-medium text-neutral-800">Local dev sign-in</span>
                    <input
                      required
                      name="email"
                      type="email"
                      placeholder="admin@example.com"
                      className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] outline-none transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </label>
                  <Button className="w-full rounded-lg text-[13px]" type="submit" variant="outline">
                    Continue without email
                  </Button>
                  <p className="text-[12px] leading-5 text-neutral-500">
                    Local development only. Use this when Supabase email sending is rate limited.
                  </p>
                </form>
              ) : null}
              {status === "check-email" ? (
                <p className="mt-4 text-[13px] text-emerald-700">Check your inbox for a sign-in link.</p>
              ) : null}
              {status === "env-missing" ? (
                <p className="mt-4 text-[13px] text-amber-700">Supabase env vars are not configured yet.</p>
              ) : null}
              {error === "invalid-email" ? (
                <p className="mt-4 text-[13px] text-red-700">Enter a valid email address.</p>
              ) : error === "otp_expired" ? (
                <p className="mt-4 text-[13px] text-red-700">That email link expired. Send yourself a fresh magic link.</p>
              ) : error === "over_email_send_rate_limit" || error === "429" ? (
                <p className="mt-4 text-[13px] text-red-700">Supabase is rate limiting emails for this address. Wait a minute, then send a fresh link.</p>
              ) : error === "email_address_invalid" ? (
                <p className="mt-4 text-[13px] text-red-700">Supabase rejected this email address. Try another address or check Auth email settings.</p>
              ) : error === "dev-link-disabled" ? (
                <p className="mt-4 text-[13px] text-red-700">Local dev sign-in is disabled outside localhost development.</p>
              ) : error === "not-invited" || error === "access-not-enabled" ? (
                <p className="mt-4 text-[13px] text-red-700">This email is not invited to the portal yet.</p>
              ) : error === "bootstrap-email-not-allowed" ? (
                <p className="mt-4 text-[13px] text-red-700">This email is not allowed to claim the first owner account.</p>
              ) : error === "admin-access-required" ? (
                <p className="mt-4 text-[13px] text-red-700">This account does not have team access.</p>
              ) : error === "client-access-required" || error === "client-membership-required" ? (
                <p className="mt-4 text-[13px] text-red-700">This account is not connected to an agency or client portal yet.</p>
              ) : error === "team-profile-incomplete" ? (
                <p className="mt-4 text-[13px] text-red-700">This team account is missing organization access.</p>
              ) : error ? (
                <p className="mt-4 text-[13px] text-red-700">Unable to complete sign-in. Error: {error}</p>
              ) : null}
              <p className="mt-4 text-center text-[13px] text-neutral-500">
                New agency?{" "}
                <Link href="/register" className="font-medium text-neutral-900 underline-offset-4 hover:underline">
                  Create an agency
                </Link>
              </p>
            </div>
          </PublicPanel>
        </div>
      </PublicWorkspace>
    </PublicPage>
  );
}

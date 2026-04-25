import { Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  const next = typeof params.next === "string" ? params.next : "/portal";
  const appUrl = getCanonicalAppUrl();
  const showDevLink = process.env.NODE_ENV !== "production" && isLocalAppUrl(appUrl);

  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-muted">
              <Mail className="size-5 text-muted-foreground" />
            </span>
            <div>
              <h1 className="text-lg font-semibold">Sign in by email</h1>
              <p className="text-sm text-muted-foreground">Clients and team users use secure magic links.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <HashSessionHandler next={next} />
          <form action={sendMagicLink} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <label className="block space-y-2">
              <span className="text-sm font-medium">Email</span>
              <input
                required
                name="email"
                type="email"
                placeholder="name@example.com"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/10"
              />
            </label>
            <Button className="w-full" type="submit">
              Send magic link
            </Button>
          </form>
          {showDevLink ? (
            <form action={createDevSignInLink} className="mt-3 space-y-3 border-t pt-3">
              <input type="hidden" name="next" value={next === "/portal" ? "/admin/bootstrap" : next} />
              <label className="block space-y-2">
                <span className="text-sm font-medium">Local dev sign-in</span>
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/10"
                />
              </label>
              <Button className="w-full" type="submit" variant="outline">
                Continue without email
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                Local development only. Use this when Supabase email sending is rate limited.
              </p>
            </form>
          ) : null}
          {status === "check-email" ? (
            <p className="mt-4 text-sm text-emerald-700">Check your inbox for a sign-in link.</p>
          ) : null}
          {status === "env-missing" ? (
            <p className="mt-4 text-sm text-amber-700">Supabase env vars are not configured yet.</p>
          ) : null}
          {error === "invalid-email" ? (
            <p className="mt-4 text-sm text-red-700">Enter a valid email address.</p>
          ) : error === "otp_expired" ? (
            <p className="mt-4 text-sm text-red-700">That email link expired. Send yourself a fresh magic link.</p>
          ) : error === "over_email_send_rate_limit" || error === "429" ? (
            <p className="mt-4 text-sm text-red-700">Supabase is rate limiting emails for this address. Wait a minute, then send a fresh link.</p>
          ) : error === "email_address_invalid" ? (
            <p className="mt-4 text-sm text-red-700">Supabase rejected this email address. Try another address or check Auth email settings.</p>
          ) : error === "dev-link-disabled" ? (
            <p className="mt-4 text-sm text-red-700">Local dev sign-in is disabled outside localhost development.</p>
          ) : error === "not-invited" || error === "access-not-enabled" ? (
            <p className="mt-4 text-sm text-red-700">This email is not invited to the portal yet.</p>
          ) : error === "bootstrap-email-not-allowed" ? (
            <p className="mt-4 text-sm text-red-700">This email is not allowed to claim the first owner account.</p>
          ) : error === "admin-access-required" ? (
            <p className="mt-4 text-sm text-red-700">This account does not have team access.</p>
          ) : error === "client-access-required" || error === "client-membership-required" ? (
            <p className="mt-4 text-sm text-red-700">This account is not connected to a client portal membership.</p>
          ) : error === "team-profile-incomplete" ? (
            <p className="mt-4 text-sm text-red-700">This team account is missing organization access.</p>
          ) : error ? (
            <p className="mt-4 text-sm text-red-700">Unable to complete sign-in. Error: {error}</p>
          ) : null}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            New agency?{" "}
            <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
              Create an agency
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

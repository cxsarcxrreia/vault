"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function HashSessionHandler({ next }: { next: string }) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";

    if (!hash) {
      return;
    }

    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const error = params.get("error") ?? params.get("error_code");

    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);

    if (error) {
      window.setTimeout(() => setMessage(`Unable to finish sign-in: ${error}`), 0);
      return;
    }

    if (!accessToken || !refreshToken) {
      return;
    }

    window.setTimeout(() => setMessage("Finishing sign-in..."), 0);

    createSupabaseBrowserClient()
      .auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      .then(({ error: sessionError }) => {
        if (sessionError) {
          setMessage(`Unable to save session: ${sessionError.message}`);
          return;
        }

        window.location.assign(next || "/admin/bootstrap");
      });
  }, [next]);

  if (!message) {
    return null;
  }

  return <p className="mb-4 rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">{message}</p>;
}

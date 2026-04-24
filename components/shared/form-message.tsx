"use client";

import { useEffect, useState } from "react";

export function FormMessage({
  type = "info",
  children,
  autoDismissMs
}: {
  type?: "info" | "success" | "error" | "warning";
  children: React.ReactNode;
  autoDismissMs?: number;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);

    if (!autoDismissMs) {
      return;
    }

    const timeoutId = window.setTimeout(() => setVisible(false), autoDismissMs);

    return () => window.clearTimeout(timeoutId);
  }, [autoDismissMs, children, type]);

  const className =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : type === "error"
        ? "border-red-200 bg-red-50 text-red-800"
        : type === "warning"
          ? "border-amber-200 bg-amber-50 text-amber-900"
          : "border-border bg-muted text-muted-foreground";

  if (!visible) {
    return null;
  }

  return <div className={`rounded-md border px-3 py-2 text-sm ${className}`}>{children}</div>;
}

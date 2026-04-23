export function FormMessage({
  type = "info",
  children
}: {
  type?: "info" | "success" | "error";
  children: React.ReactNode;
}) {
  const className =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : type === "error"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-border bg-muted text-muted-foreground";

  return <div className={`rounded-md border px-3 py-2 text-sm ${className}`}>{children}</div>;
}

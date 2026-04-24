import { cn } from "@/lib/utils/cn";

const toneClasses = {
  neutral: "border-border bg-muted text-muted-foreground",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  waiting: "border-amber-200 bg-amber-50 text-amber-800",
  review: "border-sky-200 bg-sky-50 text-sky-800",
  danger: "border-red-200 bg-red-50 text-red-700"
};

function formatBadgeText(value: string) {
  const normalized = value.replaceAll("_", " ").trim();

  if (!normalized) {
    return normalized;
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function Badge({
  children,
  tone = "neutral",
  className
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneClasses;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {typeof children === "string" ? formatBadgeText(children) : children}
    </span>
  );
}

import { cn } from "@/lib/utils/cn";

const tones = {
  neutral: "bg-muted-foreground",
  active: "bg-emerald-500",
  waiting: "bg-amber-500",
  review: "bg-sky-500",
  danger: "bg-red-500"
};

export function StatusDot({ tone = "neutral" }: { tone?: keyof typeof tones }) {
  return <span className={cn("inline-block size-2 rounded-full", tones[tone])} />;
}

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const publicFont: CSSProperties = {
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  letterSpacing: "0"
};

const titleFont: CSSProperties = {
  fontFamily: '"NdOT 57", Inter, ui-sans-serif, system-ui, sans-serif',
  letterSpacing: "0"
};

export function PublicPage({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("min-h-screen bg-white text-neutral-900", className)} style={publicFont}>
      {children}
    </main>
  );
}

export function PublicNav({
  actions,
  className
}: {
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8", className)}>
      <Link href="/" className="text-sm font-semibold text-neutral-900">
        VAULT
      </Link>
      {actions ? <nav className="flex items-center gap-2">{actions}</nav> : null}
    </header>
  );
}

export function PublicWorkspace({
  children,
  width = "default",
  className
}: {
  children: ReactNode;
  width?: "narrow" | "default" | "wide";
  className?: string;
}) {
  const widths = {
    narrow: "max-w-[760px]",
    default: "max-w-[920px]",
    wide: "max-w-6xl"
  };

  return <div className={cn("mx-auto w-full px-5 md:px-8", widths[width], className)}>{children}</div>;
}

export function PublicHeader({
  label,
  title,
  description,
  actions,
  align = "left",
  className
}: {
  label?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl", className)}>
      {label ? <p className="text-[12px] font-medium leading-none text-neutral-900/45">{label}</p> : null}
      <h1 className="text-[32px] font-semibold leading-tight text-neutral-900 md:text-[42px]" style={titleFont}>
        {title}
      </h1>
      {description ? <p className="text-[14px] leading-6 text-neutral-500 md:text-[15px]">{description}</p> : null}
      {actions ? <div className={cn("flex flex-wrap gap-2.5 pt-2", align === "center" ? "justify-center" : null)}>{actions}</div> : null}
    </div>
  );
}

export function PublicPanel({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("rounded-2xl border border-neutral-200 bg-white p-5", className)}>{children}</section>;
}

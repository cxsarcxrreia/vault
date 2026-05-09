import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const workspaceFont: CSSProperties = {
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  letterSpacing: "0"
};

const titleFont: CSSProperties = {
  fontFamily: '"NdOT 57", Inter, ui-sans-serif, system-ui, sans-serif',
  letterSpacing: "0"
};

const widths = {
  narrow: "max-w-[760px]",
  default: "max-w-[920px]",
  wide: "max-w-[1040px]"
};

export function AppWorkspace({
  children,
  className,
  width = "default"
}: {
  children: ReactNode;
  className?: string;
  width?: keyof typeof widths;
}) {
  return (
    <div className="min-h-screen bg-white px-5 pb-16 pt-16 md:px-10 md:pb-24 md:pt-28" style={workspaceFont}>
      <div className={cn("mx-auto w-full space-y-8", widths[width], className)}>{children}</div>
    </div>
  );
}

export function WorkspaceHeader({
  label,
  title,
  meta,
  actions,
  className
}: {
  label?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4 md:flex-row md:items-start md:justify-between", className)}>
      <div className="min-w-0 space-y-1.5">
        {label ? <p className="text-[12px] font-medium leading-none text-neutral-900/45">{label}</p> : null}
        <h1 className="text-[24px] font-semibold leading-tight text-neutral-900 sm:text-[26px]" style={titleFont}>
          {title}
        </h1>
        {meta ? <div className="max-w-2xl text-[13px] leading-5 text-neutral-500">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">{actions}</div> : null}
    </header>
  );
}

export function SectionBlock({
  id,
  title,
  description,
  actions,
  children,
  className
}: {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-6 space-y-4", className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold leading-none text-neutral-900">{title}</h2>
          {description ? <p className="mt-1.5 text-[13px] leading-5 text-neutral-500">{description}</p> : null}
        </div>
        {actions ? <div className="md:shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

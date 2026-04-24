import type { ReactNode } from "react";

export function ContentSection({
  id,
  title,
  description,
  actions,
  children
}: {
  id?: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="md:shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

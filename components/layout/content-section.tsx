import type { ReactNode } from "react";
import { SectionBlock } from "@/components/layout/app-workspace";

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
    <SectionBlock id={id} title={title} description={description} actions={actions}>
      {children}
    </SectionBlock>
  );
}

import { FileText } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ProjectDocument } from "@/types/domain";

export function DocumentList({ documents }: { documents: ProjectDocument[] }) {
  return (
    <Card>
      <CardContent>
        <ul className="divide-y">
          {documents.map((document) => (
            <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-md bg-muted">
                  <FileText className="size-4 text-muted-foreground" />
                </span>
                <div>
                  <p className="text-sm font-medium">{document.title}</p>
                  <p className="text-xs text-muted-foreground">{document.type}</p>
                </div>
              </div>
              <ButtonLink href={document.externalUrl} variant="outline" target="_blank" rel="noreferrer">
                Open
              </ButtonLink>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

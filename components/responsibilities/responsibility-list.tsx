import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ResponsibilityItem } from "@/types/domain";

const ownerTone = {
  agency: "review",
  client: "waiting",
  shared: "active"
} as const;

export function ResponsibilityList({ items }: { items: ResponsibilityItem[] }) {
  return (
    <Card>
      <CardContent>
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                {item.notes ? <p className="text-xs text-muted-foreground">{item.notes}</p> : null}
              </div>
              <Badge tone={ownerTone[item.owner]}>{item.owner}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

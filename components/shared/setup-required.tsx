import { Card, CardContent } from "@/components/ui/card";

export function SetupRequired({ message }: { message?: string | null }) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <h2 className="font-semibold">Supabase setup required</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {message ?? "The hosted project is reachable, but the database schema is not available yet."}
        </p>
        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          Run <span className="font-mono text-foreground">npx supabase link --project-ref &lt;project-ref&gt;</span>, then{" "}
          <span className="font-mono text-foreground">npx supabase db push</span>.
        </div>
      </CardContent>
    </Card>
  );
}

import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DevEntryPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-muted-foreground">Internal test entry</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">
            MVP route shortcuts for local testing.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Use these links to jump into the team panel or client portal while developing the product shell.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/login">
              Sign in
              <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
            <ButtonLink href="/admin" variant="outline">
              Team panel
            </ButtonLink>
            <ButtonLink href="/portal" variant="outline">
              Client portal
            </ButtonLink>
          </div>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {["Macro timeline", "Deliverables center", "Documents and responsibilities"].map((item) => (
            <Card key={item}>
              <CardContent>
                <h2 className="font-medium">{item}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  MVP foundation ready for Supabase-backed project operations.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

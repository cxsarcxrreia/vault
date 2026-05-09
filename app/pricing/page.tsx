import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PlanCard } from "@/components/plans/plan-card";
import { ButtonLink } from "@/components/ui/button";
import { PLAN_DEFINITIONS, PLAN_ORDER } from "@/features/plans/constants";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
          VAULT
        </Link>

        <section className="py-12">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-muted-foreground">Plans</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal md:text-5xl">Simple project limits for agency workspaces.</h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Start lean, keep client operations organized, and upgrade capacity when the agency needs more active project room.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PLAN_ORDER.map((tier) => {
              const plan = PLAN_DEFINITIONS[tier];

              return (
                <PlanCard
                  key={plan.tier}
                  plan={plan}
                  action={
                    <ButtonLink
                      href="/register"
                      variant={plan.isPopular ? "primary" : "outline"}
                      className="w-full"
                    >
                      {plan.ctaLabel}
                      <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                    </ButtonLink>
                  }
                  footer={
                    plan.tier === "free"
                      ? "New agencies start here by default."
                      : "Payment checkout is intentionally not connected yet; upgrades are handled manually for now."
                  }
                />
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

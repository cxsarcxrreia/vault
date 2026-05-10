import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PublicHeader, PublicPage, PublicWorkspace } from "@/components/layout/public-shell";
import { PlanCard } from "@/components/plans/plan-card";
import { ButtonLink } from "@/components/ui/button";
import { PLAN_DEFINITIONS, PLAN_ORDER } from "@/features/plans/constants";

export default function PricingPage() {
  return (
    <PublicPage>
      <PublicWorkspace width="wide" className="py-8 md:py-10">
        <Link href="/" className="inline-flex items-center text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-900">
          <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
          VAULT
        </Link>

        <section className="py-14 md:py-20">
          <PublicHeader
            label="Plans"
            title="Simple project limits for agency workspaces."
            description="Start lean, keep client operations organized, and upgrade capacity when the agency needs more active project room."
          />

          <div className="mt-10 grid gap-3 md:grid-cols-3">
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
                      className="w-full rounded-lg text-[13px]"
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
      </PublicWorkspace>
    </PublicPage>
  );
}

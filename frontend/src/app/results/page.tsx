"use client";

import Link from "next/link";

import { AreaInsightsSection } from "@/components/insights/AreaInsightsSection";
import { PageShell } from "@/components/layout/PageShell";
import { GoOutsideNote } from "@/components/results/GoOutsideNote";
import { ItineraryCard } from "@/components/results/ItineraryCard";
import { RiskSummaryCard } from "@/components/results/RiskSummaryCard";
import { Button } from "@/components/ui/Button";
import { useTripResult } from "@/lib/utils/trip-storage";

export default function ResultsPage() {
  const result = useTripResult();

  if (result === null) {
    return (
      <PageShell title="No trip yet">
        <div className="rounded-[28px] bg-[#f7f4ef] p-6 text-center text-[#163226]">
          <p>Plan a trip first to see a risk assessment and itinerary here.</p>
          <Link href="/" className="mt-4 inline-block">
            <Button>Plan a trip</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`${result.risk.destination}`}
      subtitle="The screen part is almost over."
    >
      <GoOutsideNote verdict={result.risk.verdict} />
      <RiskSummaryCard risk={result.risk} delay={0.1} />
      {result.location && (
        <AreaInsightsSection
          location={result.location}
          verdict={result.risk.verdict}
          startDate={result.plan.startDate}
          endDate={result.plan.endDate}
          delay={0.2}
        />
      )}
      <ItineraryCard plan={result.plan} risk={result.risk} delay={0.3} />
      <p className="text-center">
        <Link href="/" className="text-sm font-medium text-[#1d4a32] underline">
          Plan another trip
        </Link>
      </p>
    </PageShell>
  );
}

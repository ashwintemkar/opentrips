"use client";

import { motion } from "framer-motion";
import { Backpack, CheckCircle2, Coffee, Footprints, Mountain, ShieldAlert, ShieldCheck, Wallet } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { DisclaimerText } from "@/components/ui/DisclaimerText";
import { MockDataBadge } from "@/components/ui/MockDataBadge";
import { StaggerItem } from "@/components/ui/StaggerItem";
import type { PlanDay, PlanResponse } from "@/types/plan";
import type { RiskResponse } from "@/types/risk";

const ICON_CLASSNAME = "mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function downloadPlan(plan: PlanResponse, risk?: RiskResponse) {
  const days = plan.days
    .map(
      (day) =>
        `<li><strong>Day ${day.day}, ${escapeHtml(day.date)}</strong><br>${escapeHtml(day.activity)} (${day.distanceKm} km)</li>`,
    )
    .join("");
  const packing = plan.packing.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const warnings = plan.warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const riskBlock = risk
    ? `<h2>Landslide risk in ${escapeHtml(risk.destination)}</h2>
       <p><strong>${escapeHtml(risk.verdict)}</strong> · score ${Math.round(risk.riskScore * 100)} out of 100 · accuracy ${risk.modelMetrics.accuracy ?? "n/a"}</p>
       <p>${escapeHtml(risk.explanation)}</p>`
    : "";
  const fromBlock = plan.fromPlace ? `<p>From ${escapeHtml(plan.fromPlace)}</p>` : "";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>OpenTrips plan for ${escapeHtml(plan.destination)}</title>
  <style>
    body { font-family: Georgia, serif; background: #f6f3ee; color: #163226; margin: 0; padding: 32px; }
    main { max-width: 720px; margin: 0 auto; background: #f7f4ef; padding: 28px; border-radius: 24px; }
    h1 { margin-top: 0; }
  </style>
</head>
<body>
  <main>
    <p>OpenTrips</p>
    <h1>${escapeHtml(plan.destination)}</h1>
    ${fromBlock}
    <p>${escapeHtml(plan.startDate)} to ${escapeHtml(plan.endDate)}</p>
    ${riskBlock}
    <h2>Itinerary</h2>
    <ul>${days}</ul>
    <h2>Packing</h2>
    <ul>${packing}</ul>
    <h2>Warnings</h2>
    <ul>${warnings}</ul>
    <h2>Estimated budget</h2>
    <p>${escapeHtml(plan.budgetEstimate.currency)} ${plan.budgetEstimate.total}</p>
    <p>${escapeHtml(plan.disclaimer)}</p>
  </main>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `opentrips-${plan.destination}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Returns the icon element directly rather than a component reference, so
 * no component type gets created during render (react-hooks/static-components).
 */
function activityIcon(activity: string): ReactNode {
  const name = activity.toLowerCase();
  if (
    name.includes("coffee") ||
    name.includes("breakfast") ||
    name.includes("lunch") ||
    name.includes("dinner") ||
    name.includes("meal")
  ) {
    return <Coffee className={ICON_CLASSNAME} aria-hidden="true" />;
  }
  if (
    name.includes("trek") ||
    name.includes("hike") ||
    name.includes("climb") ||
    name.includes("summit") ||
    name.includes("peak")
  ) {
    return <Mountain className={ICON_CLASSNAME} aria-hidden="true" />;
  }
  return <Footprints className={ICON_CLASSNAME} aria-hidden="true" />;
}

function DayRow({ day, index, baseDelay }: { day: PlanDay; index: number; baseDelay: number }) {
  return (
    <StaggerItem index={index} baseDelay={baseDelay} className="relative pl-10">
      <span className="absolute top-0.5 left-0 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-emerald-500/30 bg-white text-xs font-bold text-emerald-700 shadow-sm dark:border-emerald-400/30 dark:bg-zinc-900 dark:text-emerald-300">
        {day.day}
      </span>
      <div className="glass-surface rounded-xl p-4">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          Day {day.day}, {day.date}
        </p>
        <div className="mt-2 flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          {activityIcon(day.activity)}
          <span>
            {day.activity}{" "}
            <span className="font-medium text-zinc-800 dark:text-zinc-200">({day.distanceKm} km)</span>
          </span>
        </div>
      </div>
    </StaggerItem>
  );
}

export function ItineraryCard({
  plan,
  risk,
  delay = 0,
}: {
  plan: PlanResponse;
  risk?: RiskResponse;
  delay?: number;
}) {
  return (
    <Card delay={delay}>
      <CardHeader
        title="Itinerary"
        badge={plan.isMockData ? <MockDataBadge label="Demo content" /> : undefined}
      />
      <p className="mt-1 text-sm text-zinc-500">
        {plan.fromPlace ? `From ${plan.fromPlace} · ` : ""}
        {plan.startDate} to {plan.endDate}
      </p>

      <div
        className={`mt-4 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm ${
          plan.checksPassed
            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
            : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
        }`}
      >
        {plan.checksPassed ? (
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {plan.checksPassed
          ? "Constraints check passed: budget and distance per day fit what you asked for."
          : "Constraints check flagged this plan: review distance or budget before committing."}
      </div>

      <div className="relative mt-6 space-y-5 pl-1">
        <motion.div
          aria-hidden="true"
          className="absolute top-1 bottom-1 left-[22px] w-px origin-top bg-gradient-to-b from-emerald-500/60 via-teal-500/40 to-transparent"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.1, ease: "easeOut" }}
        />

        {plan.days.map((day, index) => (
          <DayRow key={day.day} day={day} index={index} baseDelay={delay + 0.15} />
        ))}
      </div>

      <div className="mt-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#163226] dark:text-zinc-100">
          <Backpack className="h-4 w-4" aria-hidden="true" />
          Packing list
        </h3>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {plan.packing.map((item) => (
            <li key={item} className="rounded-2xl bg-white px-3 py-4 text-center text-sm text-zinc-700 ring-1 ring-black/5 dark:bg-zinc-950 dark:text-zinc-200 dark:ring-white/10">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {plan.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="flex items-center gap-2 font-medium">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Caution
          </p>
          <ul className="mt-1 space-y-1">
            {plan.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-4 py-4 ring-1 ring-black/5 dark:bg-zinc-950 dark:ring-white/10">
        <span className="flex items-center gap-2 font-medium text-[#163226] dark:text-zinc-100">
          <Wallet className="h-4 w-4" aria-hidden="true" />
          Estimated budget
        </span>
        <span className="text-lg font-semibold text-[#163226] dark:text-zinc-50">
          {plan.budgetEstimate.currency} {plan.budgetEstimate.total.toLocaleString("en-IN")}
        </span>
      </div>

      <button
        type="button"
        onClick={() => downloadPlan(plan, risk)}
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#1d4a32] px-5 py-3 text-sm font-semibold text-white"
      >
        Download this page
      </button>
      <p className="mt-2 text-xs leading-5 text-zinc-500">
        We keep only your last 3 plans on the server. This is an open source hackathon project, not a
        commercial app. Download a copy if you want to keep this one.
      </p>

      <DisclaimerText>{plan.disclaimer}</DisclaimerText>
    </Card>
  );
}

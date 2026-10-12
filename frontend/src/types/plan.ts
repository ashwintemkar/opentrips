/**
 * CONFIRMED CONTRACT: Itinerary and plan domain types.
 *
 * Reconciled against what `main.py`'s `/plan` endpoint actually returns,
 * the raw JSON shape the Tinker fine-tuned model emits (see
 * `plan_examples.jsonl`, `rule_checker.py`), not an invented richer shape.
 * No per-activity duration, difficulty label, or budget breakdown is
 * fabricated here, the model was never trained to produce those.
 */

import type { RiskVerdict } from "./risk";

export interface PlanRequest {
  place: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  constraints?: string;
  fromPlace?: string;
  /** Optional context from a prior /api/risk call, if available. */
  riskVerdict?: RiskVerdict;
  riskScore?: number;
}

export interface PlanDay {
  day: number;
  /** Derived from startDate + (day - 1), not returned by the model. */
  date: string;
  activity: string;
  distanceKm: number;
}

export interface BudgetEstimate {
  currency: "INR";
  total: number;
  breakdown?: {
    food: number;
    localTravel: number;
    misc: number;
  };
}

export interface PlanResponse {
  destination: string;
  fromPlace?: string;
  startDate: string;
  endDate: string;
  days: PlanDay[];
  packing: string[];
  warnings: string[];
  budgetEstimate: BudgetEstimate;
  /**
   * Real output of rule_checker.py's check_plan(): does this specific plan
   * respect the budget and per-day distance implied by the request. Not a
   * hardcoded true, see main.py's /plan handler.
   */
  checksPassed: boolean;
  isMockData: boolean;
  disclaimer: string;
}

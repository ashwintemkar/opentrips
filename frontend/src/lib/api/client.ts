import { getAiBackendConfig, MissingBackendConfigError } from "@/config/env";
import { generateMockPlanResponse } from "@/lib/api/mock-plan";
import { generateMockRiskResponse } from "@/lib/api/mock-risk";
import type { PlanDay, PlanRequest, PlanResponse } from "@/types/plan";
import type { RiskRequest, RiskResponse, RiskVerdict } from "@/types/risk";

/**
 * Server-only AI backend client.
 *
 * Route Handlers call this instead of talking to mocks or FastAPI directly.
 * This is the single place that decides mock-vs-proxy behavior, so the rest
 * of the app (and the frontend) never knows which mode is active.
 *
 * In proxy mode this also adapts between the Next.js app's camelCase,
 * UI-shaped types and `main.py`'s real flat/snake_case contract (see
 * PROJECT_LOG.md §12 for why an adapter here, rather than changing either
 * side's already-working code).
 */

interface BackendRiskResponse {
  risk: number;
  verdict: "go" | "caution" | "wait";
  rain_1d: number;
  rain_3d: number;
  rain_7d: number;
  rain_14d: number;
  rain_mm_forecast: number;
  model_accuracy: number;
}

interface BackendPlanDay {
  day: number;
  activity: string;
  distance_km: number;
}

interface BackendPlanResponse {
  days?: BackendPlanDay[];
  packing?: string[];
  warnings?: string[];
  budget_estimate?: number;
  checks_passed?: boolean;
  error?: string;
  raw?: string;
  parse_error?: boolean;
}

async function postJson<TResponse>(baseUrl: string, path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`AI backend request to ${path} failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

function toVerdict(verdict: "go" | "caution" | "wait"): RiskVerdict {
  return verdict.toUpperCase() as RiskVerdict;
}

/** Adds `offsetDays` whole days to an ISO date string, no timezone drift concerns at day granularity. */
function addIsoDays(isoDate: string, offsetDays: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

async function fetchRealRisk(baseUrl: string, request: RiskRequest): Promise<RiskResponse> {
  const backend = await postJson<BackendRiskResponse>(baseUrl, "/risk", {
    lat: request.latitude,
    lon: request.longitude,
    start_date: request.startDate,
    end_date: request.endDate,
  });

  const verdict = toVerdict(backend.verdict);
  const riskPercent = Math.round(backend.risk * 100);

  return {
    destination: request.place,
    riskScore: backend.risk,
    verdict,
    explanation:
      `Open-Meteo forecasts ${backend.rain_14d.toFixed(1)} mm of rain over this window. ` +
      `TabPFN, trained on real NASA landslide records, puts landslide risk at ${riskPercent}% (${verdict}).`,
    rainfallFeatures: {
      rain1dMm: backend.rain_1d,
      rain3dMm: backend.rain_3d,
      rain7dMm: backend.rain_7d,
      rain14dMm: backend.rain_14d,
    },
    modelName: "TabPFN (Prior Labs), trained on the NASA Global Landslide Catalog + Open-Meteo rainfall history",
    modelMetrics: {
      accuracy: backend.model_accuracy,
      precision: null,
      recall: null,
      f1Score: null,
      notes:
        "Accuracy is TabPFN's GEO-split score: trained with India held out entirely, tested on " +
        "India-only events. Precision and recall are not computed in this phase.",
    },
    isMockData: false,
    disclaimer:
      "Generated from real historical landslide reports and live rainfall forecasts. Not a guarantee. " +
      "Always check local weather and landslide advisories before departure.",
  };
}

async function fetchRealPlan(baseUrl: string, request: PlanRequest): Promise<PlanResponse> {
  const constraintsText = request.constraints?.trim() || "no specific constraints stated";
  const fromText = request.fromPlace?.trim() ? ` Starting from ${request.fromPlace.trim()}.` : "";
  const requestText = `Trip to ${request.place} from ${request.startDate} to ${request.endDate}.${fromText} ${constraintsText}.`;

  const backend = await postJson<BackendPlanResponse>(baseUrl, "/plan", {
    request_text: requestText,
    lat: request.latitude,
    lon: request.longitude,
    start_date: request.startDate,
    end_date: request.endDate,
    risk: request.riskScore ?? 0,
  });

  if (backend.error || backend.parse_error || !backend.days) {
    throw new Error(
      backend.error ?? "The plan model's output could not be parsed into a valid plan. Please try again.",
    );
  }

  const days: PlanDay[] = backend.days.map((day) => ({
    day: day.day,
    date: addIsoDays(request.startDate, day.day - 1),
    activity: day.activity,
    distanceKm: day.distance_km,
  }));

  return {
    destination: request.place,
    fromPlace: request.fromPlace?.trim() || undefined,
    startDate: request.startDate,
    endDate: request.endDate,
    days,
    packing: backend.packing ?? [],
    warnings: backend.warnings ?? [],
    budgetEstimate: { currency: "INR", total: backend.budget_estimate ?? 0 },
    checksPassed: backend.checks_passed ?? false,
    isMockData: false,
    disclaimer:
      "Itinerary generated by a Qwen3-8B model fine-tuned with Tinker for this task. Verify distances, " +
      "permits, and local conditions before departure.",
  };
}

export async function fetchRiskAssessment(request: RiskRequest): Promise<RiskResponse> {
  const { useMock, baseUrl } = getAiBackendConfig();

  if (useMock) {
    return generateMockRiskResponse(request);
  }

  if (!baseUrl) {
    throw new MissingBackendConfigError();
  }

  return fetchRealRisk(baseUrl, request);
}

export async function fetchPlan(request: PlanRequest): Promise<PlanResponse> {
  const { useMock, baseUrl } = getAiBackendConfig();

  if (useMock) {
    return generateMockPlanResponse(request);
  }

  if (!baseUrl) {
    throw new MissingBackendConfigError();
  }

  return fetchRealPlan(baseUrl, request);
}

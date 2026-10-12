import { NextResponse } from "next/server";

import { MissingBackendConfigError } from "@/config/env";
import { fetchPlan } from "@/lib/api/client";
import type { ApiErrorResponse } from "@/types/api";
import type { PlanRequest } from "@/types/plan";

function isValidPlanRequest(body: unknown): body is PlanRequest {
  if (typeof body !== "object" || body === null) return false;
  const candidate = body as Record<string, unknown>;

  return (
    typeof candidate.place === "string" &&
    candidate.place.trim().length > 0 &&
    typeof candidate.latitude === "number" &&
    typeof candidate.longitude === "number" &&
    typeof candidate.startDate === "string" &&
    typeof candidate.endDate === "string"
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!isValidPlanRequest(body)) {
    return NextResponse.json<ApiErrorResponse>(
      {
        error: "Invalid plan request.",
        details:
          "Expected { place: string, latitude: number, longitude: number, startDate: string, endDate: string, constraints?: string, riskVerdict?: string, riskScore?: number }",
      },
      { status: 400 },
    );
  }

  try {
    const result = await fetchPlan(body);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MissingBackendConfigError) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "AI backend is not configured.", details: error.message },
        { status: 503 },
      );
    }

    const details = error instanceof Error ? error.message : undefined;
    return NextResponse.json<ApiErrorResponse>(
      { error: "Failed to generate plan.", details },
      { status: 502 },
    );
  }
}

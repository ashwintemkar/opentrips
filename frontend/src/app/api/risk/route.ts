import { NextResponse } from "next/server";

import { MissingBackendConfigError } from "@/config/env";
import { fetchRiskAssessment } from "@/lib/api/client";
import type { ApiErrorResponse } from "@/types/api";
import type { RiskRequest } from "@/types/risk";

function isValidRiskRequest(body: unknown): body is RiskRequest {
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

  if (!isValidRiskRequest(body)) {
    return NextResponse.json<ApiErrorResponse>(
      {
        error: "Invalid risk request.",
        details:
          "Expected { place: string, latitude: number, longitude: number, startDate: string, endDate: string, constraints?: string }",
      },
      { status: 400 },
    );
  }

  try {
    const result = await fetchRiskAssessment(body);
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
      { error: "Failed to generate risk assessment.", details },
      { status: 502 },
    );
  }
}

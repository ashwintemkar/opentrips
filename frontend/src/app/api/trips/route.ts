import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getVerifiedUser } from "@/lib/supabase/server";
import type { ApiErrorResponse } from "@/types/api";
import type { PlanResponse } from "@/types/plan";
import type { RiskResponse } from "@/types/risk";

interface SaveTripRequest {
  place: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  constraints?: string;
  risk: RiskResponse;
  plan: PlanResponse;
}

function isValidSaveTripRequest(body: unknown): body is SaveTripRequest {
  if (typeof body !== "object" || body === null) return false;
  const candidate = body as Record<string, unknown>;

  return (
    typeof candidate.place === "string" &&
    typeof candidate.latitude === "number" &&
    typeof candidate.longitude === "number" &&
    typeof candidate.startDate === "string" &&
    typeof candidate.endDate === "string" &&
    typeof candidate.risk === "object" &&
    candidate.risk !== null &&
    typeof candidate.plan === "object" &&
    candidate.plan !== null
  );
}

/**
 * Persists a generated trip so it has a shareable, revisitable URL at
 * /plans/[id] (B3/B4). If DATABASE_URL isn't configured yet, this fails
 * with a 503 and the form falls back to the session-only /results page,
 * so the rest of the app never blocks on Postgres being set up.
 */
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

  if (!isValidSaveTripRequest(body)) {
    return NextResponse.json<ApiErrorResponse>(
      {
        error: "Invalid save-trip request.",
        details:
          "Expected { place, latitude, longitude, startDate, endDate, constraints?, risk, plan }",
      },
      { status: 400 },
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "Persistence is not configured.", details: "DATABASE_URL is not set." },
      { status: 503 },
    );
  }

  try {
    const account = await getVerifiedUser();
    const email = account?.email ?? null;
    const displayName =
      (account?.user_metadata?.full_name as string | undefined) ??
      (account?.user_metadata?.name as string | undefined) ??
      null;
    const image = (account?.user_metadata?.avatar_url as string | undefined) ?? null;
    let user: { id: string } | null = null;
    if (account && email) {
      const existing = await prisma.user.findFirst({
        where: { OR: [{ supabaseId: account.id }, { email }] },
      });
      user = existing
        ? await prisma.user.update({
            where: { id: existing.id },
            data: { supabaseId: account.id, email, name: displayName, image },
          })
        : await prisma.user.create({
            data: { supabaseId: account.id, email, name: displayName, image },
          });
    }

    const trip = await prisma.trip.create({
      data: {
        place: body.place,
        latitude: body.latitude,
        longitude: body.longitude,
        startDate: body.startDate,
        endDate: body.endDate,
        constraints: body.constraints ?? null,
        riskJson: body.risk as object,
        planJson: body.plan as object,
        userId: user?.id ?? null,
      },
    });

    if (user) {
      const older = await prisma.trip.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip: 3,
        select: { id: true },
      });
      if (older.length > 0) {
        await prisma.trip.deleteMany({
          where: { id: { in: older.map((row) => row.id) } },
        });
      }
    }

    return NextResponse.json({ id: trip.id });
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      { error: "Failed to save the trip." },
      { status: 500 },
    );
  }
}

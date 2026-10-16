import { NextResponse } from "next/server";

import { getAiBackendConfig } from "@/config/env";

export async function GET() {
  const { useMock, baseUrl } = getAiBackendConfig();
  if (useMock || !baseUrl) {
    return NextResponse.json({ ok: true });
  }

  try {
    const response = await fetch(`${baseUrl}/healthz`, {
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    return NextResponse.json({ ok: response.ok });
  } catch {
    return NextResponse.json({ ok: false });
  }
}

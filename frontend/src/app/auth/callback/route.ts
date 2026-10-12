import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function resolveBaseUrl(request: Request, origin: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (!forwardedHost) return origin;
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${forwardedProto}://${forwardedHost}`;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const base = resolveBaseUrl(request, origin);
  const code = searchParams.get("code");
  const authError = searchParams.get("error_description") ?? searchParams.get("error");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}/`);
    }
    return NextResponse.redirect(
      `${base}/sign-in?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${base}/sign-in${authError ? `?error=${encodeURIComponent(authError)}` : ""}`,
  );
}

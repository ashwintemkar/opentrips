import { NextResponse } from "next/server";

/** Login is handled by Supabase, not by this proxy. Pages stay reachable. */
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};

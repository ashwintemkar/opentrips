import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { SignInCard } from "@/components/auth/SignInCard";
import { getVerifiedUser } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const errorMessages: Record<string, string> = {
  Configuration: "Google sign-in is not set on this server yet. You can still go back and generate a plan.",
  AccessDenied: "Access was denied. Please try another Google account.",
};

/** Reduces any callback URL (absolute or relative) to a path on this site. */
function toLocalPath(value: string | string[] | undefined) {
  if (typeof value !== "string") return "/";
  try {
    const url = new URL(value, "http://localhost");
    return `${url.pathname}${url.search}`;
  } catch {
    return "/";
  }
}

export default function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="flex w-full flex-1 items-center justify-center bg-[#f6f3ee] px-6 py-16">
      <Suspense fallback={null}>
        <SignInContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function SignInContent({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const params = await searchParams;
  const redirectTo = toLocalPath(params.next ?? params.callbackUrl);
  const user = await getVerifiedUser();

  if (user) redirect(redirectTo);

  const errorMessage =
    typeof params.error === "string"
      ? (errorMessages[params.error] ?? "Something went wrong while signing in. Please try again.")
      : undefined;

  return <SignInCard redirectTo={redirectTo} errorMessage={errorMessage} />;
}

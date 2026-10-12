import { connection } from "next/server";
import Link from "next/link";

import { UserMenuButton } from "@/components/auth/UserMenuButton";
import { getVerifiedUser } from "@/lib/supabase/server";

export async function UserMenu() {
  await connection();
  const user = await getVerifiedUser();

  return (
    <div className="flex items-center gap-3">
      <Link href="/history" className="text-sm font-medium text-[#1d4a32] dark:text-emerald-300">
        History
      </Link>
      {user?.email ? (
        <UserMenuButton
          name={
            (user.user_metadata?.full_name as string | undefined) ??
            (user.user_metadata?.name as string | undefined) ??
            "Traveler"
          }
          email={user.email}
          image={(user.user_metadata?.avatar_url as string | undefined) ?? null}
        />
      ) : (
        <Link
          href="/sign-in"
          className="rounded-full bg-[#1d4a32] px-3 py-1.5 text-sm font-semibold text-white"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}

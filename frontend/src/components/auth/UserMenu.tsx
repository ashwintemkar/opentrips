import { connection } from "next/server";

import { UserMenuButton } from "@/components/auth/UserMenuButton";
import { getVerifiedUser } from "@/lib/supabase/server";

export async function UserMenu() {
  await connection();
  const user = await getVerifiedUser();
  if (!user?.email) return null;

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    "Traveler";

  return (
    <UserMenuButton
      name={name}
      email={user.email}
      image={(user.user_metadata?.avatar_url as string | undefined) ?? null}
    />
  );
}

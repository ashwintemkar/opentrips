import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { prisma } from "@/lib/db/prisma";
import { getVerifiedUser } from "@/lib/supabase/server";

export default function HistoryPage() {
  return (
    <Suspense fallback={<PageShell title="History"><p>Loading your plans…</p></PageShell>}>
      <HistoryList />
    </Suspense>
  );
}

async function HistoryList() {
  await connection();
  const account = await getVerifiedUser();

  if (!account?.email) {
    return (
      <PageShell title="History" subtitle="Sign in to see the plans kept for you.">
        <div className="rounded-[28px] bg-[#f7f4ef] p-6 text-[#163226]">
          <p>We keep your last 3 plans after you sign in.</p>
          <Link href="/sign-in" className="mt-4 inline-block rounded-full bg-[#1d4a32] px-4 py-2 text-sm font-semibold text-white">
            Sign in
          </Link>
        </div>
      </PageShell>
    );
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ supabaseId: account.id }, { email: account.email }] },
  });
  const trips = user
    ? await prisma.trip.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
      })
    : [];

  return (
    <PageShell title="History" subtitle="Your last 3 plans. Download a page if you want to keep an older one.">
      {trips.length === 0 ? (
        <div className="rounded-[28px] bg-[#f7f4ef] p-6 text-[#163226]">
          <p>No saved plans yet.</p>
          <Link href="/" className="mt-4 inline-block text-sm font-medium underline">
            Plan a trip
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {trips.map((trip) => (
            <li key={trip.id} className="rounded-[28px] bg-[#f7f4ef] px-5 py-4 text-[#163226]">
              <Link href={`/plans/${trip.id}`} className="text-lg font-semibold">
                {trip.place}
              </Link>
              <p className="text-sm text-zinc-600">
                {trip.startDate} to {trip.endDate}
              </p>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}

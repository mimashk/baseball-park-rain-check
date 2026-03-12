import type { Metadata } from "next";
import { gameSortKey } from "@/lib/ui/team";
import { TodayGameSummaryGrid } from "@/components/top/TodayGameSummaryGrid";
import { TeamHeaderNav } from "@/components/top/TeamHeaderNav";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getTopDashboardData } from "@/lib/server/dashboardData";

export const revalidate = 600;
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const data = await getTopDashboardData();
  const sortedGames = [...data.games].sort((a, b) => {
    const keyA = gameSortKey(a.home.teamId, a.away.teamId);
    const keyB = gameSortKey(b.home.teamId, b.away.teamId);
    if (keyA !== keyB) return keyA - keyB;
    return new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime();
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10">
      <SiteHeader batchCompletedAtUtc={data.batchCompletedAtUtc} />
      <TeamHeaderNav />
      <TodayGameSummaryGrid dateJst={data.dateJst} games={sortedGames} />
    </main>
  );
}

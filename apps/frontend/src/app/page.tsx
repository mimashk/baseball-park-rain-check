import { getTopDashboard } from "@/lib/api/getTopDashboard";
import { fmtUpdate } from "@/lib/formatters/jst";
import { gameSortKey } from "@/lib/ui/teamOrder";
import { TodayGameSummaryGrid } from "@/components/top/TodayGameSummaryGrid";
import { TeamHeaderNav } from "@/components/top/TeamHeaderNav";

export default async function Home() {
  const data = await getTopDashboard();
  const sortedGames = [...data.games].sort((a, b) => {
    const keyA = gameSortKey(a.home.teamId, a.away.teamId);
    const keyB = gameSortKey(b.home.teamId, b.away.teamId);
    if (keyA !== keyB) return keyA - keyB;
    return new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime();
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="/logo.png"
            alt="ロゴ"
            className="h-6 w-6 object-contain sm:h-20 sm:w-20"
          />
          <h1 className="font-bold text-strong leading-tight text-xl sm:text-3xl">
            <span className="block text-sm sm:text-xl">プロ野球</span>
            <span className="block">雨天中止予報</span>
          </h1>
        </div>
        <p className="text-sm text-muted">
          最終更新: {fmtUpdate(data.batchCompletedAtUtc)}
        </p>
      </header>
      <TeamHeaderNav />

      <TodayGameSummaryGrid dateJst={data.dateJst} games={sortedGames} />
    </main>
  );
}

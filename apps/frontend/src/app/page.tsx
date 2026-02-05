import { getTopDashboard } from "@/lib/api/getTopDashboard";
import { fmtUpdate } from "@/lib/formatters/jst";
import { SectionCard } from "@/components/ui/SectionCard";
import { TodayGameCards } from "@/components/top/TodayGameCards";
import { gameSortKey } from "@/lib/ui/teamOrder";

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
        <div>
          <p className="text-sm text-muted">本日の全試合</p>
          <h1 className="text-2xl font-bold text-strong">雨天中止予測</h1>
        </div>
        <p className="text-sm text-muted">
          更新: {fmtUpdate(data.batchCompletedAtUtc)} (JST)
        </p>
      </header>

      <SectionCard>
        <TodayGameCards games={sortedGames} />
      </SectionCard>
    </main>
  );
}

import { getTop } from "../lib/api/getTop";
import { fmtUpdate } from "../lib/formatters/jst";
import { SectionCard } from "../components/ui/SectionCard";
import { TodaySummary } from "../components/top/TodaySummary";
import { HourlyForecast } from "../components/top/HourlyForecast";
import { WeeklyForecast } from "../components/top/WeeklyForecast";

export default async function Home() {
  const data = await getTop();
  const showHourly = !!data.todayGame && data.hourlyWindow.length > 0;
  const showWeekly = data.weekly.length > 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">ファンチームの今日の試合</p>
          <h1 className="text-2xl font-bold text-strong">雨天中止予測</h1>
        </div>
        <p className="text-sm text-muted">
          更新: {fmtUpdate(data.batchCompletedAtUtc)} (JST)
        </p>
      </header>

      <SectionCard>
        <TodaySummary dateJst={data.dateJst} game={data.todayGame} />
      </SectionCard>

      {showHourly && (
        <SectionCard>
          <HourlyForecast hourly={data.hourlyWindow} />
        </SectionCard>
      )}

      {showWeekly && (
        <SectionCard>
          <WeeklyForecast weekly={data.weekly} />
        </SectionCard>
      )}
    </main>
  );
}

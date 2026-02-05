import { getTeamDashboard } from "../../../lib/api/getTeamDashboard";
import { fmtUpdate } from "../../../lib/formatters/jst";
import { SectionCard } from "../../../components/ui/SectionCard";
import { TodaySummary } from "../../../components/team/TodaySummary";
import { HourlyForecast } from "../../../components/team/HourlyForecast";
import { WeeklyForecast } from "../../../components/team/WeeklyForecast";
import { TeamId } from "@/types/TeamId";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: TeamId }>;
}) {
  const { teamId } = await params;
  const data = await getTeamDashboard(teamId);
  const showHourly = !!data.todayGame && data.hourlyWeathers.length > 0;
  const showWeekly = data.weeklyWeathers.length > 0;

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
        <TodaySummary
          dateJst={data.dateJst}
          game={data.todayGame}
          hourly={data.hourlyWeathers}
        />
      </SectionCard>

      {showHourly && (
        <SectionCard>
          <HourlyForecast hourly={data.hourlyWeathers} />
        </SectionCard>
      )}

      {showWeekly && (
        <SectionCard>
          <WeeklyForecast weekly={data.weeklyWeathers} />
        </SectionCard>
      )}
    </main>
  );
}

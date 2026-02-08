import { getTeamDashboard } from "../../../lib/api/getTeamDashboard";
import { fmtUpdate } from "../../../lib/formatters/jst";
import { SectionCard } from "../../../components/ui/SectionCard";
import { TodaySummary } from "../../../components/team/TodaySummary";
import { HourlyForecast } from "../../../components/team/HourlyForecast";
import { WeeklyForecast } from "../../../components/team/WeeklyForecast";
import { TeamId } from "@/types/TeamId";
import { TEAM_THEMES } from "@/components/ui/TeamTheme";
import { TEAM_META } from "@/mocks/teamDashboardFixtures";
import Image from "next/image";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: TeamId }>;
}) {
  const { teamId } = await params;
  const data = await getTeamDashboard(teamId);
  const showHourly = !!data.todayGame && data.hourlyWeathers.length > 0;
  const showWeekly = data.weekly.length > 0;

  const teamTheme = TEAM_THEMES[teamId as TeamId];

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 h-[120px] w-full" />
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

        <SectionCard>
          <TodaySummary
            dateJst={data.dateJst}
            game={data.todayGame}
            hourly={data.hourlyWeathers}
            focusTeamId={teamId}
          />
        </SectionCard>

        {showHourly && (
          <SectionCard>
            <HourlyForecast hourly={data.hourlyWeathers} />
          </SectionCard>
        )}

        {showWeekly && (
          <SectionCard>
            <WeeklyForecast weekly={data.weekly} teamId={teamId} />
          </SectionCard>
        )}
      </main>
    </div>
  );
}

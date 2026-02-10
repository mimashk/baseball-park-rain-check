import { getTeamDashboard } from "../../../lib/api/getTeamDashboard";
import { fmtUpdate } from "../../../lib/formatters/jst";
import { SectionCard } from "../../../components/ui/SectionCard";
import { TodaySummary } from "../../../components/team/TodaySummary";
import { HourlyForecast } from "../../../components/team/HourlyForecast";
import { WeeklyForecast } from "../../../components/team/WeeklyForecast";
import { TeamId } from "@/types/TeamId";
import { TEAM_META } from "@/lib/ui/teamMeta";
import type { Metadata } from "next";
import { XShareButton } from "@/components/ui/XShareButton";

export async function generateMetadata({
  params,
}: {
  params: { teamId: string };
}): Promise<Metadata> {
  const { teamId } = await params;
  const teamName = TEAM_META[teamId as TeamId].fullName;

  const title = `${teamName} 雨天中止予報`;
  const description = `${teamName}の今日の試合の雨天中止確率をチェック！`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/team/${teamId}`,
      type: "website",
      images: [
        {
          url: `/team/${teamId}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${teamName} 雨天中止予報`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/team/${teamId}/opengraph-image`],
    },
  };
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: TeamId }>;
}) {
  const { teamId } = await params;
  const data = await getTeamDashboard(teamId);
  const showHourly = !!data.todayGame && data.hourlyWeathers.length > 0;
  const showWeekly = data.weekly.length > 0;
  const teamName = TEAM_META[teamId].fullName;

  const shareText = "今日の試合の雨天中止確率をチェック！";
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/team/${teamId}`;
  const hashtags = [
    "雨天中止予報",
    "プロ野球",
    teamName,
    data.todayGame?.ballpark ?? "",
  ];

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 h-[120px] w-full pointer-events-none" />
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
          <div className="flex flex-col items-end gap-2">
            <p className="text-xs sm:text-sm text-muted">
              最終更新: {fmtUpdate(data.batchCompletedAtUtc)}
            </p>
            <XShareButton text={shareText} url={shareUrl} hashtags={hashtags} />
          </div>
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

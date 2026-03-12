import { SectionCard } from "@/components/ui/SectionCard";
import { TodaySummary } from "@/components/team/TodaySummary";
import { HourlyForecast } from "@/components/team/HourlyForecast";
import { WeeklyForecast } from "@/components/team/WeeklyForecast";
import { TeamId } from "@/types/TeamId";
import { TEAM_IDS, TEAM_META } from "@/lib/ui/team";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { XShareButton } from "@/components/ui/XShareButton";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getTeamDashboardData } from "@/lib/server/dashboardData";

export const revalidate = 600;

export const dynamicParams = false;

export function generateStaticParams() {
  return TEAM_IDS.map((teamId) => ({ teamId }));
}

function isTeamId(value: string): value is TeamId {
  return TEAM_IDS.includes(value as TeamId);
}

export async function generateMetadata({
  params,
}: {
  params: { teamId: string };
}): Promise<Metadata> {
  const { teamId } = await params;
  if (!isTeamId(teamId)) notFound();

  const teamName = TEAM_META[teamId as TeamId].fullName;

  const title = `${teamName} 雨天中止予報`;
  const description = `${teamName}の試合の雨天中止確率を予測して表示するサービス。${teamName}のホーム球場の過去10年分の雨天中止データを分析して正確な中止予測をお届け。`;

  return {
    title,
    description,
    alternates: {
      canonical: `/team/${teamId}`,
    },
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
  if (!isTeamId(teamId)) notFound();

  const data = await getTeamDashboardData(teamId);
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
  ]
    .map((v) => (v ?? "").trim())
    .filter((v) => v.length > 0);

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 h-[120px] w-full pointer-events-none" />
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10">
        <SiteHeader
          batchCompletedAtUtc={data.batchCompletedAtUtc}
          rightSlot={
            <XShareButton text={shareText} url={shareUrl} hashtags={hashtags} />
          }
        />

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

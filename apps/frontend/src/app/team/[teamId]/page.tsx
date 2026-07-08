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
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { FaqSection } from "@/components/ui/FaqSection";
import { TOP_FAQ_ITEMS } from "@/lib/ui/faq";
import { TeamAfterWeatherAd } from "@/components/team/TeamAfterWeatherAd";

export const revalidate = 600;

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
  const teamShortName = TEAM_META[teamId].shortName;
  const ballParkName = data.todayGame?.ballpark ?? "";

  const shareText = "今日の試合の雨天中止確率をチェック！";
  const hashtags = [
    "雨天中止予報",
    "プロ野球",
    "天気",
    "雨",
    "中止",
    "雨天中止",
    teamShortName,
    teamName,
    data.todayGame?.ballpark ?? "",
  ]
    .map((v) => (v ?? "").trim())
    .filter((v) => v.length > 0);

  const shareUrl = new URL(
    `/team/${teamId}`,
    process.env.NEXT_PUBLIC_SITE_URL!,
  ).toString();

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 h-[120px] w-full pointer-events-none" />
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-12 px-4 py-10">
        <SiteHeader
          batchCompletedAtUtc={data.batchCompletedAtUtc}
          rightSlot={
            <XShareButton text={shareText} url={shareUrl} hashtags={hashtags} />
          }
        />

        <section className="space-y-2">
          <SectionEyebrow>
            今日の<span className="normal-case">{teamName}</span>の試合
          </SectionEyebrow>
          <SectionCard>
            <TodaySummary
              dateJst={data.dateJst}
              game={data.todayGame}
              hourly={data.hourlyWeathers}
              focusTeamId={teamId}
            />
          </SectionCard>
        </section>

        {showHourly && (
          <section className="space-y-2">
            <SectionEyebrow>試合開始時間周辺の天気予報</SectionEyebrow>
            <SectionCard>
              <HourlyForecast hourly={data.hourlyWeathers} />
            </SectionCard>
          </section>
        )}

        {showHourly && showWeekly && <TeamAfterWeatherAd />}

        {showWeekly && (
          <section className="space-y-2">
            <SectionEyebrow>週間天気予報と試合スケジュール</SectionEyebrow>
            <SectionCard>
              <WeeklyForecast weekly={data.weekly} teamId={teamId} />
            </SectionCard>
          </section>
        )}

        <section className="space-y-2">
          <SectionEyebrow>よくある質問</SectionEyebrow>
          <FaqSection items={TOP_FAQ_ITEMS} />
        </section>
      </main>
    </div>
  );
}

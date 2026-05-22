import type { Metadata } from "next";
import { gameSortKey } from "@/lib/ui/team";
import { TodayGameSummaryGrid } from "@/components/top/TodayGameSummaryGrid";
import { TeamHeaderNav } from "@/components/top/TeamHeaderNav";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getTopDashboardData } from "@/lib/server/dashboardData";
import { TopIntroCard } from "@/components/top/TopIntroCard";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { FaqSection } from "@/components/ui/FaqSection";
import { TOP_FAQ_ITEMS } from "@/lib/ui/faq";
import { TopAfterGamesAd } from "@/components/top/TopAfterGamesAd";

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
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-14 px-4 py-10">
      <SiteHeader batchCompletedAtUtc={data.batchCompletedAtUtc} />
      <section className="space-y-2">
        <SectionEyebrow>このサービスについて</SectionEyebrow>
        <TopIntroCard />
      </section>

      <section className="space-y-2">
        <SectionEyebrow>球団を選ぶ</SectionEyebrow>
        <TeamHeaderNav />
      </section>

      <section className="space-y-2">
        <SectionEyebrow>今日の試合一覧</SectionEyebrow>
        <TodayGameSummaryGrid dateJst={data.dateJst} games={sortedGames} />
      </section>

      <TopAfterGamesAd />

      <section className="space-y-2">
        <SectionEyebrow>よくある質問</SectionEyebrow>
        <FaqSection items={TOP_FAQ_ITEMS} />
      </section>
    </main>
  );
}

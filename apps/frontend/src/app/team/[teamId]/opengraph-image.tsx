import { ImageResponse } from "next/og";
import { TEAM_META, TEAM_LOGO } from "@/lib/ui/team";
import { getTeamDashboard } from "@/lib/api/getTeamDashboard";
import { TeamId } from "@/types/TeamId";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  const teamName =
    TEAM_META[teamId as keyof typeof TEAM_META]?.fullName ?? "チーム";
  const logoPath = TEAM_LOGO[teamId];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const backgroundImage = `url("${baseUrl}/og/raindrops.png")`;
  const teamLogoUrl = logoPath ? `${baseUrl}${logoPath}` : undefined;
  const siteLogoUrl = `${baseUrl}/logo/logo.webp`;

  const fontBoldUrl =
    "https://storage.googleapis.com/bbprc-public-assets/NotoSansJP-Bold.ttf";
  const fontBold = await fetch(fontBoldUrl).then((res) => res.arrayBuffer());

  const data = await getTeamDashboard(teamId as TeamId);

  // daily由来の天気（weekly）を使う
  const todayWeather = data.weekly[0]?.weather?.text ?? "天気情報更新中";
  const hasTodayGame = Boolean(data.todayGame);

  const leadText = hasTodayGame
    ? `今日の天気は${todayWeather}！`
    : "今日は試合がないので";
  const teamNameText = `${teamName}の`;

  const subText = hasTodayGame
    ? `本日の試合の雨天中止予測をチェック！`
    : `明日以降の試合情報と天気をチェック！`;

  const dateText = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundImage,
          backgroundSize: "1200px 630px",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0f172a",
        }}
      >
        <div
          style={{
            width: 980,
            height: 420,
            backgroundColor: "white",
            borderRadius: 32,
            padding: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 36,
            boxShadow: "0 18px 36px rgba(15, 23, 42, 0.18)",
          }}
        >
          {teamLogoUrl ? (
            <img
              src={teamLogoUrl}
              width={220}
              height={220}
              style={{ objectFit: "contain" }}
            />
          ) : null}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              maxWidth: 650,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={siteLogoUrl}
                height={32}
                width={32}
                style={{ objectFit: "contain" }}
              />
              <div style={{ fontSize: 22, opacity: 0.75 }}>
                プロ野球 雨天中止予報
              </div>
            </div>

            <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.25 }}>
              {leadText}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                fontSize: 34,
                fontWeight: 700,
                lineHeight: 1.35,
              }}
            >
              <div style={{ display: "flex" }}>{teamNameText}</div>
              <div style={{ display: "flex" }}>{subText}</div>
            </div>
            <div style={{ fontSize: 20, opacity: 0.6 }}>{dateText}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "NotoSansJP",
          data: fontBold,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}

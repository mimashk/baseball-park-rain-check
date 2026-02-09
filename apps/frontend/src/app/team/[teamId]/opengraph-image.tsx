import { ImageResponse } from "next/og";
import { TEAM_META } from "@/lib/ui/teamMeta";
import { TEAM_LOGO } from "@/lib/ui/teamLogo";
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
  const siteLogoUrl = `${baseUrl}/logo.png`;

  const fontBold = await fetch(`${baseUrl}/fonts/NotoSansJP-Bold.ttf`).then(
    (res) => res.arrayBuffer()
  );

  const data = await getTeamDashboard(teamId as TeamId);
  const game = data.todayGame;

  const dateText = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const probText =
    typeof game?.cancelProbPct === "number" ? `${game.cancelProbPct}%` : null;

  let message: string;

  if (!game) {
    message = "本日の試合はありません";
  } else if (game.cancelProbReason === "UNKNOWN_BALLPARK") {
    message = "メイン球場ではないため雨天中止確率は表示できません";
  } else if (game.cancelProbReason === "INDOOR") {
    message = "屋内球場のため開催予定です";
  } else if (game.cancelProbReason === "PENDING") {
    message = "雨天中止確率は準備中です";
  } else {
    message = "雨天中止確率は準備中です";
  }

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
            justifyContent: "space-between",
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
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
            <div
              style={{ fontSize: 36, fontWeight: 700, display: "flex", gap: 8 }}
            >
              <span>本日の</span>
              <span>{teamName}</span>
              <span>の試合の</span>
            </div>
            {probText ? (
              <div style={{ display: "flex" }}>
                <span style={{ fontSize: 56, fontWeight: 800 }}>
                  雨天中止予測確率は{probText}
                </span>
              </div>
            ) : (
              <div style={{ fontSize: 28, opacity: 0.9 }}>{message}</div>
            )}
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

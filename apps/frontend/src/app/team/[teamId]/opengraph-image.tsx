import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { TEAM_IDS, TEAM_META } from "@/lib/ui/team";
import { getTeamDashboardData } from "@/lib/server/dashboardData";
import { TeamId } from "@/types/TeamId";
import {
  OG_BG,
  OG_SITE_LOGO,
  OG_TEAM_LOGOS,
} from "@/generated/ogAssets.generated";
import { OG_FONT_BASE64 } from "@/generated/ogFont.generated";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 600;
const fontData = Uint8Array.from(atob(OG_FONT_BASE64), (c) =>
  c.charCodeAt(0),
).buffer;

function isTeamId(value: string): value is TeamId {
  return TEAM_IDS.includes(value as TeamId);
}

// satori は CSS変数非対応のため cancelProb.ts と同じ閾値でhex直書き
function cancelColorHex(pct: number) {
  if (pct >= 80) return "#ef4444";
  if (pct >= 50) return "#eab308";
  return "#16a34a";
}

export default async function Image({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  if (!isTeamId(teamId)) notFound();

  const teamName =
    TEAM_META[teamId as keyof typeof TEAM_META]?.fullName ?? "チーム";

  // 変更: getRequestOrigin / new URL(...) を撤廃し、同梱データURIを使う
  const backgroundImage = `url("${OG_BG}")`;
  const teamLogoUrl = OG_TEAM_LOGOS[teamId];
  const siteLogoUrl = OG_SITE_LOGO;

  const data = await getTeamDashboardData(teamId as TeamId);

  // 中止確率が確定している場合のみ数値表示（屋内/予測準備中/未知球場は null）
  const game = data.todayGame;
  const cancelProb =
    game && game.cancelProbReason === null && game.cancelProbPct != null
      ? Math.round(game.cancelProbPct)
      : null;

  // 中止確率が出せない場合のフォールバックをケース別に出し分け
  const reason = game?.cancelProbReason ?? null;
  let leadText: string;
  let teamLineText: string;
  let subText: string;
  if (!game) {
    // 試合なし
    leadText = "今日は試合がないので";
    teamLineText = `${teamName}の`;
    subText = "明日以降の試合情報と天気をチェック！";
  } else if (reason === "INDOOR") {
    // 屋内（安心系）
    leadText = "今日はドーム開催！";
    teamLineText = `${teamName}の試合は`;
    subText = "雨天中止の心配なし！";
  } else if (reason === "PENDING") {
    // 予測準備中（誘導）
    leadText = "中止予測はまもなく公開";
    teamLineText = `${teamName}の`;
    subText = "本日の試合の予測を準備中です";
  } else {
    // 未知球場（UNKNOWN_BALLPARK）など
    leadText = "今日の試合をチェック！";
    teamLineText = `${teamName}の`;
    subText = "試合情報と天気をチェック！";
  }

  const dateText = new Date().toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return new ImageResponse(
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
        fontFamily: "NotoSansJP",
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
            alt=""
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
              alt=""
              style={{ objectFit: "contain" }}
            />
            <div style={{ fontSize: 22, opacity: 0.75 }}>
              プロ野球 雨天中止予報
            </div>
          </div>

          {cancelProb !== null ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 700,
                  opacity: 0.85,
                }}
              >
                <div style={{ display: "flex" }}>{teamName}の</div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  fontWeight: 800,
                  marginTop: -6,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
                  今日の試合の中止予測は
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 70,
                    lineHeight: 1,
                    color: cancelColorHex(cancelProb),
                  }}
                >
                  {cancelProb}%
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 700,
                  opacity: 0.85,
                }}
              >
                中止確率は定期的に変わります。こまめに確認を！
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 52,
                  fontWeight: 800,
                  lineHeight: 1.25,
                }}
              >
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
                <div style={{ display: "flex" }}>{teamLineText}</div>
                <div style={{ display: "flex" }}>{subText}</div>
              </div>
            </div>
          )}
          <div style={{ fontSize: 20, opacity: 0.6 }}>{dateText}</div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "NotoSansJP", data: fontData, weight: 700, style: "normal" },
      ],
    },
  );
}

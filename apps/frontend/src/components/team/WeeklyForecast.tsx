import { Weekly } from "@/types/Weekly";
import { TeamId } from "@/types/TeamId";
import { fmtDate, fmtTime } from "@/lib/formatters/jst";
import { WeatherIcon } from "@/components/weather/WeatherIcon";
import { TeamRow } from "@/components/ui/TeamAvatar";
import { cancelColor } from "@/lib/utils/cancelProb";
import { format1dp, formatPercent } from "@/lib/formatters/number";
import { CancelProbabilityBadge } from "./CancelProbabilityBadge";

type Props = { weekly: Weekly[]; teamId: TeamId };

/**
 * カード左ボーダーの色。中止確率がある日はその色、それ以外は控えめなグレー。
 * 週間を縦に見たとき、中止リスクが高い日(赤)が一覧で目立つようにする。
 */
function weeklyAccentColor(game: Weekly["game"]): string {
  if (game && game.cancelProbReason === null && game.cancelProbPct !== null) {
    return cancelColor(game.cancelProbPct);
  }
  return "var(--border)";
}

export function WeeklyForecast({ weekly, teamId }: Props) {
  if (!weekly.length) return null;

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {weekly.map((w) => {
          const opponent =
            w.game?.home.teamId === teamId
              ? w.game.away
              : (w.game?.home ?? null);

          return (
            <div
              key={w.dateJst}
              className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white shadow-sm border-l-4"
              style={{ borderLeftColor: weeklyAccentColor(w.game) }}
            >
              <div className="border-b border-[color:var(--border)] bg-slate-50 px-4 py-2">
                <p className="text-sm font-semibold text-strong">
                  {fmtDate(`${w.dateJst}T00:00:00Z`)}
                </p>
              </div>

              <div className="grid grid-cols-1 divide-y divide-[color:var(--border)] md:grid-cols-2 md:divide-x md:divide-y-0">
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm">
                    <WeatherIcon code={w.weather?.wmoCode ?? null} />
                    <span className="text-strong">
                      {w.weather?.text ?? "--"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    最高 {format1dp(w.highC) ?? "--"}℃ / 最低{" "}
                    {format1dp(w.lowC) ?? "--"}℃
                  </p>
                  <p className="text-sm text-muted">
                    降水確率 {formatPercent(w.weather?.precipProbPct) ?? "--"}%
                    / 降水量 {format1dp(w.weather?.precipMm) ?? "--"}mm
                  </p>
                </div>

                <div className="px-4 py-3">
                  {w.game ? (
                    <div className="flex flex-col gap-2">
                      <TeamRow team={opponent!} />
                      <div className="text-sm font-medium text-strong">
                        開始 {fmtTime(w.game.startAtUtc)} / {w.game.ballpark}
                      </div>
                      <div className="mt-1">
                        <CancelProbabilityBadge game={w.game} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">試合予定はありません</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

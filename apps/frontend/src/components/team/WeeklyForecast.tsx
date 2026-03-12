import { Weekly } from "@/types/Weekly";
import { TeamId } from "@/types/TeamId";
import { fmtDate, fmtTime } from "@/lib/formatters/jst";
import { WeatherIcon } from "@/components/weather/WeatherIcon";
import { TeamRow } from "@/components/ui/TeamAvatar";
import { weatherBorderClass } from "@/lib/utils/weatherBorder";
import { TEAM_THEMES } from "@/lib/ui/team";
import { format1dp, formatPercent } from "@/lib/formatters/number";

type Props = { weekly: Weekly[]; teamId: TeamId };

export function WeeklyForecast({ weekly, teamId }: Props) {
  if (!weekly.length) return null;

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-strong">
          週間予報 / 試合予定
        </h2>
      </div>

      <div className="grid-2col">
        <div className="flex flex-col gap-4">
          {weekly.map((w) => {
            const opponent =
              w.game?.home.teamId === teamId
                ? w.game.away
                : w.game?.home ?? null;
            const opponentTheme = opponent
              ? TEAM_THEMES[opponent.teamId as TeamId]
              : null;

            return (
              <div key={w.dateJst} className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-strong">
                  {fmtDate(`${w.dateJst}T00:00:00Z`)}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                  <div
                    className={`rounded-2xl border border-[color:var(--border)] bg-white px-3 py-3 shadow-sm h-full border-l-4 ${weatherBorderClass(
                      w.weather?.wmoCode ?? null
                    )}`}
                  >
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <WeatherIcon code={w.weather?.wmoCode ?? null} />
                      <span className="text-strong">
                        {w.weather?.text ?? "--"}
                      </span>
                    </div>
                    <p className="text-sm text-muted">
                      最高 {format1dp(w.highC) ?? "--"}℃ / 最低{" "}
                      {format1dp(w.lowC) ?? "--"}℃
                    </p>
                    <p className="text-sm text-muted">
                      降水確率 {formatPercent(w.weather?.precipProbPct) ?? "--"}
                      % / 降水量 {format1dp(w.weather?.precipMm) ?? "--"}mm
                    </p>
                  </div>

                  <div
                    className="rounded-2xl border border-[color:var(--border)] bg-white px-3 py-3 shadow-sm h-full border-l-4"
                    style={
                      opponentTheme
                        ? { borderLeftColor: opponentTheme.border }
                        : undefined
                    }
                  >
                    {w.game ? (
                      <div className="flex flex-col gap-2">
                        <TeamRow team={opponent!} />
                        <div className="text-sm text-strong font-medium">
                          開始 {fmtTime(w.game.startAtUtc)} / {w.game.ballpark}
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
    </div>
  );
}

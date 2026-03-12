import { Hourly } from "@/types/HourlyWeather";
import { TodayGame } from "@/types/TodayGame";
import { cancelColor } from "@/lib/utils/cancelProb";
import { fmtDate, fmtTime } from "@/lib/formatters/jst";
import { TeamBlock } from "@/components/ui/TeamAvatar";
import { WeatherIcon } from "@/components/weather/WeatherIcon";
import { CancelProbGauge } from "./CancelProbGauge";
import { getWeatherAtStart } from "@/lib/utils/weatherAtStart";
import { getGameStatusInfo } from "@/lib/utils/gameStatusLabel";
import { getWeatherDisplay } from "@/lib/utils/weatherDisplay";
import { getCancelProbDisplay } from "@/lib/utils/cancelProbDisplay";
import { TeamId } from "@/types/TeamId";
import { TEAM_THEMES } from "@/lib/ui/team";
import { format1dp, formatPercent } from "@/lib/formatters/number";

type Props = {
  dateJst: string;
  game: TodayGame | null;
  hourly: Hourly[] | undefined;
  focusTeamId?: TeamId; // 追加
};

export function TodaySummary({ dateJst, game, hourly, focusTeamId }: Props) {
  const weatherAtStart = getWeatherAtStart(
    game?.startAtUtc,
    hourly,
    game?.weatherAtGameTime
  );

  const isFocusHome = game?.home.teamId === focusTeamId;
  const leftTeam = game ? (isFocusHome ? game.home : game.away) : null;
  const rightTeam = game ? (isFocusHome ? game.away : game.home) : null;

  const leftColor = leftTeam
    ? TEAM_THEMES[leftTeam.teamId as TeamId].border
    : undefined;
  const rightColor = rightTeam
    ? TEAM_THEMES[rightTeam.teamId as TeamId].border
    : undefined;

  const statusInfo = getGameStatusInfo(game?.status);
  const cancelProbDisplay = game ? getCancelProbDisplay(game) : "--";
  const weatherDisplay = game ? getWeatherDisplay(game) : "--";
  return (
    <div
      className="rounded-2xl border border-[color:var(--border)] bg-white shadow-sm border-l-4"
      style={{
        borderLeftColor: leftColor ?? "transparent",
        boxShadow: rightColor ? `inset -4px 0 0 ${rightColor}` : undefined,
      }}
    >
      <div className="p-6 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-xl font-semibold text-strong">
            {fmtDate(`${dateJst}T00:00:00Z`)}
          </span>
        </div>

        {!game ? (
          <div className="text-muted font-medium">本日の試合はありません</div>
        ) : (
          <div className="flex flex-col gap-7">
            <div className="grid grid-cols-3 items-center gap-3 md:justify-items-center">
              <TeamBlock team={leftTeam!} align="left" />
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-lg font-semibold text-strong">
                  {fmtTime(game.startAtUtc)}
                </span>
                <span className="text-sm text-muted">{game.ballpark}</span>
                {statusInfo && (
                  <span className="badge" style={statusInfo.style}>
                    {statusInfo.label}
                  </span>
                )}
              </div>
              <TeamBlock team={rightTeam!} align="right" />
            </div>

            <div className="flex flex-col items-center gap-5 text-center">
              {game.status === "CANCELLED" ||
              game.status === "COMPLETED" ? null : cancelProbDisplay ===
                "--" ? (
                <span className="text-muted">--</span>
              ) : cancelProbDisplay === "予測準備中" ? (
                <span className="text-muted">予測準備中</span>
              ) : (
                <CancelProbGauge
                  value={game.cancelProbPct!}
                  color={cancelColor(game.cancelProbPct!)}
                />
              )}

              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                {" "}
                <p className="text-sm text-muted">開始時刻の天気</p>{" "}
                {weatherAtStart ? (
                  <div className="mt-2 flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-3">
                    {" "}
                    <WeatherIcon code={weatherAtStart.wmoCode} />{" "}
                    <span className="text-strong">
                      {weatherAtStart.text ?? "--"}
                    </span>{" "}
                    <span className="text-muted text-xs sm:text-sm">
                      {" "}
                      {format1dp(weatherAtStart.temperatureC) ?? "--"}℃ /
                      降水確率{" "}
                      {formatPercent(weatherAtStart.precipProbPct) ?? "--"}% /
                      降水量 {format1dp(weatherAtStart.precipMm) ?? "--"}mm{" "}
                    </span>{" "}
                  </div>
                ) : (
                  <span className="text-muted">{weatherDisplay}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

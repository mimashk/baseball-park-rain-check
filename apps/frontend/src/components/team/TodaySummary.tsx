import { Hourly } from "@/types/HourlyWeather";
import { TodayGame } from "@/types/TodayGame";
import { cancelColor } from "../../lib/utils/cancelProb";
import { fmtDate, fmtTime } from "../../lib/formatters/jst";
import { InfoRow } from "../ui/InfoRow";
import { TeamBlock } from "../ui/TeamAvatar";
import { WeatherIcon } from "../weather/WeatherIcon";
import { CancelProbGauge } from "./CancelProbGauge";
import { getWeatherAtStart } from "@/lib/utils/weatherAtStart";
import { getGameStatusInfo } from "@/lib/utils/gameStatusLabel";

type Props = {
  dateJst: string;
  game: TodayGame | null;
  hourly: Hourly[] | undefined;
};

export function TodaySummary({ dateJst, game, hourly }: Props) {
  const weatherAtStart = getWeatherAtStart(
    game?.startAtUtc,
    hourly,
    game?.weatherAtGameTime
  );
  const statusInfo = getGameStatusInfo(game?.status);
  return (
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
            <TeamBlock team={game.home} align="left" />
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
            <TeamBlock team={game.away} align="right" />
          </div>

          <div className="flex flex-col items-center gap-5 text-center">
            {game.status === "CANCELLED" ||
            game.status === "COMPLETED" ? null : game.cancelProbPct === null ? (
              <span className="text-muted">予測準備中</span>
            ) : (
              <CancelProbGauge
                value={game.cancelProbPct}
                color={cancelColor(game.cancelProbPct)}
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
                    {weatherAtStart.temperatureC ?? "--"}℃ / 降水確率{" "}
                    {weatherAtStart.precipProbPct ?? "--"}% / 降水量{" "}
                    {weatherAtStart.precipMm ?? "--"}mm{" "}
                  </span>{" "}
                </div>
              ) : (
                <span className="text-muted">--</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

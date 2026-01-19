import { TodayGame } from "../../types/top";
import { cancelColor } from "../../lib/utils/cancelProb";
import { fmtDate, fmtTime } from "../../lib/formatters/jst";
import { InfoRow } from "../ui/InfoRow";
import { TeamBlock } from "../ui/TeamAvatar";
import { WeatherIcon } from "../weather/WeatherIcon";

type Props = { dateJst: string; game: TodayGame | null };

export function TodaySummary({ dateJst, game }: Props) {
  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted">本日日付 (JST)</span>
          <span className="text-xl font-semibold text-strong">
            {fmtDate(`${dateJst}T00:00:00Z`)}
          </span>
        </div>
        {game && (
          <span className="badge">
            ステータス <span className="text-strong">{game.status}</span>
          </span>
        )}
      </div>

      {!game ? (
        <div className="text-muted font-medium">本日の試合はありません</div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-3 items-center gap-3">
            <TeamBlock team={game.home} align="left" />
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-lg font-semibold text-strong">
                {fmtTime(game.startAtUtc)}
              </span>
              <span className="text-sm text-muted">{game.ballpark}</span>
            </div>
            <TeamBlock team={game.away} align="right" />
          </div>

          <div className="flex flex-wrap gap-3">
            <InfoRow label="開始時刻の天気">
              {game.weatherAtGameTime ? (
                <span className="flex items-center gap-2">
                  <WeatherIcon code={game.weatherAtGameTime.wmoCode} />
                  <span className="text-strong">
                    {game.weatherAtGameTime.text ?? "--"}
                  </span>
                  <span className="text-muted">
                    {game.weatherAtGameTime.temperatureC ?? "--"}℃ / 降水確率{" "}
                    {game.weatherAtGameTime.precipProbPct ?? "--"}% / 降水量{" "}
                    {game.weatherAtGameTime.precipMm ?? "--"}mm
                  </span>
                </span>
              ) : (
                <span className="text-muted">--</span>
              )}
            </InfoRow>

            {game.status === "CANCELLED" ||
            game.status === "COMPLETED" ? null : (
              <InfoRow label="雨天中止予測">
                {game.cancelProbPct === null ? (
                  <span className="text-muted">予測準備中</span>
                ) : (
                  <span
                    className="text-2xl font-bold"
                    style={{ color: cancelColor(game.cancelProbPct) }}
                  >
                    {Math.round(game.cancelProbPct)}%
                  </span>
                )}
              </InfoRow>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

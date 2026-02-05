import { TodayGame } from "@/types/TodayGame";
import { fmtTime } from "@/lib/formatters/jst";
import { WeatherIcon } from "@/components/weather/WeatherIcon";
import { getGameStatusInfo } from "@/lib/utils/gameStatusLabel";

type Props = { games: TodayGame[] };

export function TodayGameCards({ games }: Props) {
  if (!games.length)
    return <p className="text-muted">本日の試合はありません</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {games.map((game) => {
        const statusInfo = getGameStatusInfo(game.status);
        return (
          <div key={game.gameId} className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>{game.ballpark}</span>
              {statusInfo && (
                <span className="badge" style={statusInfo.style}>
                  {statusInfo.label}
                </span>
              )}
            </div>

            <div className="mt-2 text-strong font-semibold">
              {game.home.name} vs {game.away.name}
            </div>

            <div className="mt-2 text-sm text-muted">
              開始 {fmtTime(game.startAtUtc)}
            </div>

            <div className="mt-3 text-sm">
              <p className="text-muted">開始時刻の天気</p>
              {game.weatherAtGameTime ? (
                <div className="mt-1 flex items-center gap-2">
                  <WeatherIcon code={game.weatherAtGameTime.wmoCode} />
                  <span>{game.weatherAtGameTime.text ?? "--"}</span>
                  <span className="text-muted">
                    {game.weatherAtGameTime.temperatureC ?? "--"}℃
                  </span>
                </div>
              ) : (
                <span className="text-muted">--</span>
              )}
            </div>

            <div className="mt-2 text-sm text-muted">
              中止確率 {game.cancelProbPct ?? "--"}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

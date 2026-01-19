import { Weekly } from "@/types/top";
import { fmtDate, fmtTime } from "@/lib/formatters/jst";
import { WeatherIcon } from "@/components/weather/WeatherIcon";
import { TeamRow } from "@/components/ui/TeamAvatar";

type Props = { weekly: Weekly[] };

export function WeeklyForecast({ weekly }: Props) {
  if (!weekly.length) return null;

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-strong">
          週間予報 / 試合予定
        </h2>
        <p className="text-sm text-muted">7日分固定 / 欠損は "--"</p>
      </div>

      <div className="grid-2col">
        <div className="flex flex-col gap-3">
          {weekly.map((w, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[color:var(--border)] px-3 py-3 shadow-sm bg-white/90"
            >
              <p className="text-sm font-semibold text-strong">
                {fmtDate(`${w.dateJst}T00:00:00Z`)}
              </p>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <WeatherIcon code={w.weather?.wmoCode ?? null} />
                <span className="text-strong">{w.weather?.text ?? "--"}</span>
              </div>
              <p className="text-sm text-muted">
                最高 {w.highC ?? "--"}℃ / 最低 {w.lowC ?? "--"}℃
              </p>
              <p className="text-sm text-muted">
                降水確率 {w.weather?.precipProbPct ?? "--"}% / 降水量{" "}
                {w.weather?.precipMm ?? "--"}mm
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {weekly.map((w, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[color:var(--border)] px-3 py-3 shadow-sm bg-white/90"
            >
              <p className="text-sm font-semibold text-strong">
                {fmtDate(`${w.dateJst}T00:00:00Z`)}
              </p>
              {w.game ? (
                <div className="mt-2 flex flex-col gap-2">
                  <TeamRow team={w.game.home} />
                  <div className="text-sm text-muted">
                    開始 {fmtTime(w.game.startAtUtc)} / {w.game.ballpark}
                  </div>
                  <TeamRow team={w.game.away} />
                </div>
              ) : (
                <p className="text-sm text-muted mt-2">試合なし</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

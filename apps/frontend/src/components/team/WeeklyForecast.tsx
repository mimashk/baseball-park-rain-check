import { Weekly } from "@/types/WeeklyWeather";
import { fmtDate, fmtTime } from "@/lib/formatters/jst";
import { WeatherIcon } from "@/components/weather/WeatherIcon";
import { TeamRow } from "@/components/ui/TeamAvatar";
import { weatherBorderClass } from "@/lib/utils/weatherBorder";
import { TEAM_THEMES } from "../ui/TeamTheme";

type Props = { weekly: Weekly[] };

export function WeeklyForecast({ weekly }: Props) {
  const teamTheme = TEAM_THEMES["hanshin"];
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
          {weekly.map((w) => (
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
                    最高 {w.highC ?? "--"}℃ / 最低 {w.lowC ?? "--"}℃
                  </p>
                  <p className="text-sm text-muted">
                    降水確率 {w.weather?.precipProbPct ?? "--"}% / 降水量{" "}
                    {w.weather?.precipMm ?? "--"}mm
                  </p>
                </div>

                <div
                  className="rounded-2xl border border-[color:var(--border)] bg-white px-3 py-3 shadow-sm h-full border-l-4"
                  style={{ borderLeftColor: teamTheme.border }}
                >
                  {w.game ? (
                    <div className="flex flex-col gap-2">
                      <TeamRow team={w.game.home} />
                      <div className="text-sm text-strong font-medium">
                        開始 {fmtTime(w.game.startAtUtc)} / {w.game.ballpark}
                      </div>
                      <TeamRow team={w.game.away} />
                    </div>
                  ) : (
                    <p className="text-sm text-muted">試合予定はありません</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

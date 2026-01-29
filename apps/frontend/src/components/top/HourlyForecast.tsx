import { Hourly } from "../../types/top";
import { fmtTime } from "../../lib/formatters/jst";
import { WeatherIcon } from "../weather/WeatherIcon";

type Props = { hourly: Hourly[] };

export function HourlyForecast({ hourly }: Props) {
  if (!hourly.length) return null;

  return (
    <div className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-strong">
          試合開始時間周辺の天気予報
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {hourly.map((slot, idx) => (
          <div
            key={idx}
            className="min-w-[140px] rounded-2xl border border-[color:var(--border)] bg-white/90 px-3 py-3 shadow-sm"
          >
            <p className="text-sm font-semibold text-strong">
              {fmtTime(slot.timeUtc)}
            </p>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <WeatherIcon code={slot.weather?.wmoCode ?? null} />
              <span className="text-strong">{slot.weather?.text ?? "--"}</span>
            </div>
            <p className="text-sm text-muted mt-1">
              気温 {slot.weather?.temperatureC ?? "--"}℃
            </p>
            <p className="text-sm text-muted">
              降水確率 {slot.weather?.precipProbPct ?? "--"}%
            </p>
            <p className="text-sm text-muted">
              降水量 {slot.weather?.precipMm ?? "--"}mm
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

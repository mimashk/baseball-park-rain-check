import { Hourly } from "@/types/HourlyWeather";
import { fmtTime } from "@/lib/formatters/jst";
import { WeatherIcon } from "@/components/weather/WeatherIcon";
import { format1dp, formatPercent } from "@/lib/formatters/number";

type Props = { hourly: Hourly[] };

export function HourlyForecast({ hourly }: Props) {
  if (!hourly.length) return null;

  return (
    <div className="p-5 flex flex-col gap-3">
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
              気温 {format1dp(slot.weather?.temperatureC) ?? "--"}℃
            </p>
            <p className="text-sm text-muted">
              降水確率 {formatPercent(slot.weather?.precipProbPct) ?? "--"}%
            </p>
            <p className="text-sm text-muted">
              降水量 {format1dp(slot.weather?.precipMm) ?? "--"}mm
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

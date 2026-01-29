import { Hourly, Weather } from "@/types/top";

export function getWeatherAtStart(
  startAtUtc: string | null | undefined,
  hourly: Hourly[] | undefined,
  fallback: Weather | null | undefined
): Weather | null {
  if (!startAtUtc || !hourly?.length) return fallback ?? null;

  const target = new Date(startAtUtc).getTime();
  const closest = hourly.reduce((a, b) =>
    Math.abs(new Date(a.timeUtc).getTime() - target) <
    Math.abs(new Date(b.timeUtc).getTime() - target)
      ? a
      : b
  );

  return closest.weather ?? fallback ?? null;
}

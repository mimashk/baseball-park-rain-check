type Props = { code: number | null };

export function WeatherIcon({ code }: Props) {
  if (code === null) return <span className="text-lg">--</span>;

  const icon =
    code < 3
      ? "☀️"
      : code < 50
      ? "☁️"
      : code < 70
      ? "🌧️"
      : code < 80
      ? "❄️"
      : code < 85
      ? "🌧️"
      : code < 90
      ? "❄️"
      : code < 100
      ? "⚡️"
      : "☁️";

  return <span className="text-lg">{icon}</span>;
}

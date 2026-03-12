export function format1dp(value: number | null | undefined, fallback = "--") {
  if (value == null || Number.isNaN(value)) return fallback;
  return (Math.round(value * 10) / 10).toFixed(1); // 常に小数1桁
}

export function formatPercent(
  value: number | null | undefined,
  fallback = "--"
) {
  if (value == null || Number.isNaN(value)) return fallback;
  return String(Math.round(value));
}

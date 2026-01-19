export function cancelColor(pct: number) {
  if (pct >= 80) return "var(--danger)";
  if (pct >= 50) return "var(--warning)";
  return "var(--success)";
}

// apps/frontend/src/lib/utils/weatherBorder.ts
export const weatherBorderClass = (code: number | null) => {
  if (code === null) return "border-l-[color:var(--border)]";
  if (code < 3) return "border-l-[color:var(--warning)]";
  if (code < 50) return "border-l-[color:var(--border)]";
  if (code < 70) return "border-l-[color:var(--accent)]";
  if (code < 80) return "border-l-[color:var(--success)]";
  return "border-l-[color:var(--danger)]";
};

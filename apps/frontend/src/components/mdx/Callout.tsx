import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  tone?: "info" | "warn";
};

export function Callout({ children, tone = "info" }: Props) {
  const toneClass =
    tone === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : "border-sky-200 bg-sky-50 text-slate-800";

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm leading-7 ${toneClass}`}
    >
      {children}
    </div>
  );
}

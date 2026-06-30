import { cancelColor } from "@/lib/utils/cancelProb";

type CancelInfo = {
  cancelProbPct: number | null;
  cancelProbReason: "UNKNOWN_BALLPARK" | "PENDING" | "INDOOR" | null;
};

/**
 * 中止確率バッジ。
 * - 予測あり: 中止確率(%)を色分け(緑/黄/赤)して大きく表示
 * - 予測なし: 理由(屋内球場 / 予測対象外 / 予測準備中)を控えめに表示
 */
export function CancelProbabilityBadge({ game }: { game: CancelInfo }) {
  const isPct = game.cancelProbReason === null && game.cancelProbPct !== null;

  if (isPct) {
    const pct = game.cancelProbPct as number;
    return (
      <div
        className="inline-flex items-baseline gap-1.5 rounded-xl px-3 py-1.5 text-white shadow-sm"
        style={{ backgroundColor: cancelColor(pct) }}
      >
        <span className="text-xs font-medium opacity-90">中止確率</span>
        <span className="text-lg font-bold leading-none">
          {pct}
          <span className="ml-0.5 text-xs font-semibold">%</span>
        </span>
      </div>
    );
  }

  const label =
    game.cancelProbReason === "INDOOR"
      ? "屋内球場"
      : game.cancelProbReason === "UNKNOWN_BALLPARK"
        ? "予測対象外"
        : "予測準備中";

  return (
    <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-medium text-muted">
      {label}
    </span>
  );
}

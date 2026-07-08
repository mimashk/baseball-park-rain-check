import { TodayGame } from "@/types/TodayGame";
import { formatPercent } from "@/lib/formatters/number";

export function getCancelProbDisplay(game: TodayGame) {
  if (game.cancelProbReason === "INDOOR") return "屋内球場開催のため予測なし";
  if (game.cancelProbReason === "UNKNOWN_BALLPARK")
    return "各ホーム球場以外での開催のため予測なし";
  if (game.cancelProbReason === "PENDING" || game.cancelProbPct === null)
    return "予測準備中";

  return `${formatPercent(game.cancelProbPct)}%`;
}

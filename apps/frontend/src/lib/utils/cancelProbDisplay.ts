import { TodayGame } from "@/types/TodayGame";

export function getCancelProbDisplay(game: TodayGame) {
  const isNotApplicable =
    game.cancelProbReason === "INDOOR" ||
    game.cancelProbReason === "UNKNOWN_BALLPARK";

  if (isNotApplicable) return "--";
  if (game.cancelProbReason === "PENDING" || game.cancelProbPct === null)
    return "予測準備中";

  return `${game.cancelProbPct}%`;
}

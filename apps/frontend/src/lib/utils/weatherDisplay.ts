import { TodayGame } from "@/types/TodayGame";

export function getWeatherDisplay(game: TodayGame): string {
  if (game.weatherAtGameTime?.text) return game.weatherAtGameTime.text;
  const isNotApplicable =
    game.weatherAtGameTimeReason === "UNKNOWN_BALLPARK" ||
    game.weatherAtGameTimeReason === "PENDING";
  return isNotApplicable ? "--" : "--";
}

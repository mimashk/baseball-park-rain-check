import { TodayGame } from "@/types/TodayGame";

export function getWeatherDisplay(game: TodayGame): string {
  if (game.weatherAtGameTime?.text) return game.weatherAtGameTime.text;
  return "--";
}

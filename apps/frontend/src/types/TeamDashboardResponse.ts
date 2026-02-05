import { Hourly } from "./HourlyWeather";
import { TodayGame } from "./TodayGame";
import { Weekly } from "./WeeklyWeather";

export type TeamDashboardResponse = {
  batchCompletedAtUtc: string;
  dateJst: string;
  todayGame: TodayGame | null;
  hourlyWeathers: Hourly[];
  weeklyWeathers: Weekly[];
};

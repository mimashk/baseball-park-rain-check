import { Hourly } from "./HourlyWeather";
import { TodayGame } from "./TodayGame";
import { Weekly } from "./Weekly";

export type TeamDashboardResponse = {
  batchCompletedAtUtc: string;
  dateJst: string;
  todayGame: TodayGame | null;
  hourlyWeathers: Hourly[];
  weekly: Weekly[];
};

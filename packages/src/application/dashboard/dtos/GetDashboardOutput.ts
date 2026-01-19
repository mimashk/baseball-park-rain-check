import { DashboardGameDto } from "./DashboardGameDto";
import { DashboardHourlyWeatherDto } from "./DashboardHourlyWeatherDto";
import { DashboardWeeklyWeatherAndGameDto } from "./DashboardWeeklyWeatherAndGameDto";

export interface GetDashboardOutput {
  batchCompletedAtUtc: string;
  dateJst: string;
  todayGame: DashboardGameDto | null;
  hourlyWindow: DashboardHourlyWeatherDto[];
  weekly: DashboardWeeklyWeatherAndGameDto[];
}

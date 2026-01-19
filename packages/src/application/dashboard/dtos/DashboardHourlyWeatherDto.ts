import { DashboardWeatherDto } from "./DashboardWeatherDto";

export interface DashboardHourlyWeatherDto {
  timeUtc: string;
  weather: DashboardWeatherDto | null;
}

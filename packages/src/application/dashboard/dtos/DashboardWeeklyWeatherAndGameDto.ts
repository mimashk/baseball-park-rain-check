import { DashboardTeamDto } from "./DashboardTeamDto";
import { DashboardWeatherDto } from "./DashboardWeatherDto";

export interface DashboardWeeklyWeatherAndGameDto {
  dateJst: string;
  weather: DashboardWeatherDto | null;
  highC: number | null;
  lowC: number | null;
  game: {
    gameId: string;
    startAtUtc: string;
    ballpark: string;
    home: DashboardTeamDto;
    away: DashboardTeamDto;
  } | null;
}

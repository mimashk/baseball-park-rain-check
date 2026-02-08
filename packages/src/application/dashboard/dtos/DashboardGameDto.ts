import { DashboardTeamDto } from "./DashboardTeamDto";
import { DashboardWeatherDto } from "./DashboardWeatherDto";

export interface DashboardGameDto {
  gameId: string;
  startAtUtc: string;
  ballpark: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "CANCELLED" | "COMPLETED";
  home: DashboardTeamDto;
  away: DashboardTeamDto;
  weatherAtGameTime: DashboardWeatherDto | null;
  weatherAtGameTimeReason: "UNKNOWN_BALLPARK" | "PENDING" | null;
  cancelProbPct: number | null;
  cancelProbReason: "INDOOR" | "UNKNOWN_BALLPARK" | "PENDING" | null;
}

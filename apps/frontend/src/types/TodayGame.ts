import { Team } from "./Team";
import { Weather } from "./Weather";

export type TodayGame = {
  gameId: string;
  startAtUtc: string;
  ballpark: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "CANCELLED" | "COMPLETED";
  home: Team;
  away: Team;
  weatherAtGameTime: Weather | null;
  cancelProbPct: number | null;
};

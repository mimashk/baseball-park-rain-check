import { Team } from "./Team";
import { Weather } from "./Weather";

export type Weekly = {
  dateJst: string;
  weather: Weather | null;
  highC: number | null;
  lowC: number | null;
  game: {
    gameId: string;
    startAtUtc: string;
    ballpark: string;
    home: Team;
    away: Team;
    cancelProbPct: number | null;
    cancelProbReason: "UNKNOWN_BALLPARK" | "PENDING" | "INDOOR" | null;
  } | null;
};

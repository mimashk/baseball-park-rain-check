export type Team = { teamId: string; name: string };

export type Weather = {
  text: string | null;
  wmoCode: number | null;
  temperatureC: number | null;
  precipProbPct: number | null;
  precipMm: number | null;
};

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

export type Hourly = {
  timeUtc: string;
  weather: Weather | null;
};

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
  } | null;
};

export type TopResponse = {
  batchCompletedAtUtc: string;
  dateJst: string;
  todayGame: TodayGame | null;
  hourlyWindow: Hourly[];
  weekly: Weekly[];
};

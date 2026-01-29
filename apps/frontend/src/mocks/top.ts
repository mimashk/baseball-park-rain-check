import { TodayGame, TopResponse } from "@/types/top";

type TeamId =
  | "HT"
  | "YG"
  | "YS"
  | "C"
  | "D"
  | "DB"
  | "F"
  | "M"
  | "B"
  | "L"
  | "H"
  | "E";

const baseWeather = {
  text: "弱い雨",
  wmoCode: 61,
  temperatureC: 8,
  precipProbPct: 60,
  precipMm: 1.2,
};

function buildHourly(startAtUtc: string) {
  const base = new Date(startAtUtc);
  return Array.from({ length: 6 }, (_, i) => {
    const t = new Date(base);
    t.setHours(t.getHours() + (i - 3));

    const rawPrecipMm = 0.5 + (i - 3) * 0.2;
    const rawProb = 40 + (i - 3) * 5;

    return {
      timeUtc: t.toISOString(),
      weather: {
        ...baseWeather,
        temperatureC: 7 + (i - 3),
        precipProbPct: Math.max(0, Math.round(rawProb)),
        precipMm: Math.max(0, Math.round(rawPrecipMm * 10) / 10),
      },
    };
  });
}

function buildWeekly(
  dateJst: string,
  home: TeamId,
  away: TeamId,
  ballpark: string
) {
  const start = new Date(`${dateJst}T00:00:00+09:00`);
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dJst = d.toISOString().slice(0, 10);
    return {
      dateJst: dJst,
      weather:
        i === 0 ? baseWeather : { ...baseWeather, text: "くもり", wmoCode: 3 },
      highC: 10 + i,
      lowC: 4 + i,
      game:
        i % 2 === 0
          ? {
              gameId: `mock-${dJst}-${home}-${away}`,
              startAtUtc: `${dJst}T10:00:00Z`,
              ballpark,
              home: { teamId: home, name: "阪神" },
              away: { teamId: away, name: "巨人" },
            }
          : null,
    };
  });
}

export function buildMockTop(teamId: TeamId, dateJst?: string): TopResponse {
  const date = dateJst ?? "2026-01-19";

  const home: TeamId = "HT";
  const away: TeamId = "YG";
  const ballpark = "阪神甲子園球場";

  const todayGame: TodayGame = {
    gameId: `mock-today-${home}-${away}`,
    startAtUtc: `${date}T10:00:00Z`,
    ballpark,
    status: "SCHEDULED",
    home: { teamId: home, name: "阪神" },
    away: { teamId: away, name: "巨人" },
    weatherAtGameTime: baseWeather,
    cancelProbPct: 35,
  };

  return {
    batchCompletedAtUtc: `${date}T00:10:00Z`,
    dateJst: date,
    todayGame,
    hourlyWindow: buildHourly(todayGame.startAtUtc),
    weekly: buildWeekly(date, home, away, ballpark),
  };
}

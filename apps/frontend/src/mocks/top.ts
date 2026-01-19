import { TopResponse } from "@/types/top";

type TeamId = "HT" | "YG";

const baseWeather = {
  text: "弱い雨",
  wmoCode: 61,
  temperatureC: 8,
  precipProbPct: 60,
  precipMm: 1.2,
};

function buildHourly(baseDateUtc: string) {
  return [0, 1, 2, 3, 4, 5].map((h) => {
    const hour = 9 + h;
    const hh = String(hour).padStart(2, "0");
    return {
      timeUtc: `${baseDateUtc}T${hh}:00:00Z`,
      weather: {
        ...baseWeather,
        temperatureC: 7 + h,
        precipProbPct: 40 + h * 5,
        precipMm: 0.5 + h * 0.2,
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
              home: { teamId: home, name: home === "HT" ? "阪神" : "巨人" },
              away: { teamId: away, name: away === "HT" ? "阪神" : "巨人" },
            }
          : null,
    };
  });
}

export function buildMockTop(teamId: TeamId, dateJst?: string): TopResponse {
  const date = dateJst ?? "2026-01-19";
  const isHT = teamId === "HT";

  const home: TeamId = isHT ? "HT" : "YG";
  const away: TeamId = isHT ? "YG" : "HT";
  const ballpark = isHT ? "阪神甲子園球場" : "東京ドーム";

  return {
    batchCompletedAtUtc: `${date}T00:10:00Z`,
    dateJst: date,
    todayGame: {
      gameId: `mock-today-${home}-${away}`,
      startAtUtc: `${date}T10:00:00Z`,
      ballpark,
      status: "SCHEDULED",
      home: { teamId: home, name: home === "HT" ? "阪神" : "巨人" },
      away: { teamId: away, name: away === "HT" ? "阪神" : "巨人" },
      weatherAtGameTime: baseWeather,
      cancelProbPct: 35,
    },
    hourlyWindow: buildHourly(date),
    weekly: buildWeekly(date, home, away, ballpark),
  };
}

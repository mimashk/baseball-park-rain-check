import { TeamDashboardResponse } from "@/types/TeamDashboardResponse";
import { TodayGame } from "@/types/TodayGame";
import { Team } from "@/types/Team";
import { Weather } from "@/types/Weather";
import {
  TEAM_META,
  getMatchupForTeam,
  getTeamScenario,
  WeeklyPattern,
} from "./teamDashboardFixtures";
import { TeamId } from "@/types/TeamId";

function buildHourly(startAtUtc: string, baseWeather: Weather) {
  const base = new Date(startAtUtc);
  const baseTemp = baseWeather.temperatureC ?? 0;
  const baseProb = baseWeather.precipProbPct ?? 0;
  const baseMm = baseWeather.precipMm ?? 0;

  return Array.from({ length: 6 }, (_, i) => {
    const t = new Date(base);
    t.setHours(t.getHours() + (i - 3));

    return {
      timeUtc: t.toISOString(),
      weather: {
        ...baseWeather,
        temperatureC: baseTemp + (i - 3),
        precipProbPct: Math.max(0, Math.round(baseProb + (i - 3) * 5)),
        precipMm: Math.max(0, Math.round((baseMm + (i - 3) * 0.2) * 10) / 10),
      },
    };
  });
}

function buildWeekly(
  dateJst: string,
  pattern: WeeklyPattern,
  teamId: Team["teamId"]
) {
  const start = new Date(`${dateJst}T00:00:00+09:00`);

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dJst = d.toISOString().slice(0, 10);

    const highC = pattern.highBase + i;
    const lowC = pattern.lowBase + i;
    const weatherBase = pattern.weatherCycle[i % pattern.weatherCycle.length];
    const weather = {
      ...weatherBase,
      temperatureC: Math.round((highC + lowC) / 2),
    };

    const hasGame = pattern.gameDays.includes(i);
    const matchup = hasGame ? getMatchupForTeam(dJst, teamId as TeamId) : null;

    return {
      dateJst: dJst,
      weather,
      highC,
      lowC,
      game: matchup
        ? {
            gameId: `mock-${dJst}-${matchup.home}-${matchup.away}`,
            startAtUtc: `${dJst}T10:00:00Z`,
            ballpark: matchup.ballpark,
            home: {
              teamId: matchup.home,
              name: TEAM_META[matchup.home].name,
            },
            away: {
              teamId: matchup.away,
              name: TEAM_META[matchup.away].name,
            },
          }
        : null,
    };
  });
}

export function buildMockTeam(
  teamId: string,
  dateJst?: string
): TeamDashboardResponse {
  const date = dateJst ?? "2026-01-19";
  const { id, weatherBase, weeklyPattern } = getTeamScenario(teamId);

  const matchup = getMatchupForTeam(date, id);
  const todayGame: TodayGame | null = matchup
    ? {
        gameId: `mock-today-${matchup.home}-${matchup.away}`,
        startAtUtc: `${date}T10:00:00Z`,
        ballpark: matchup.ballpark,
        status: "SCHEDULED",
        home: { teamId: matchup.home, name: TEAM_META[matchup.home].name },
        away: { teamId: matchup.away, name: TEAM_META[matchup.away].name },
        weatherAtGameTime: weatherBase,
        weatherAtGameTimeReason: null,
        cancelProbPct: TEAM_META[matchup.home].isOpenAir ? 30 : null,
        cancelProbReason: TEAM_META[matchup.home].isOpenAir ? null : "INDOOR",
      }
    : null;

  return {
    batchCompletedAtUtc: `${date}T00:10:00Z`,
    dateJst: date,
    todayGame,
    hourlyWeathers: todayGame
      ? buildHourly(todayGame.startAtUtc, weatherBase)
      : [],
    weekly: buildWeekly(date, weeklyPattern, id),
  };
}

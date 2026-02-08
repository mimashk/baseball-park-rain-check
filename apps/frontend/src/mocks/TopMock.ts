import { TopDashboardResponse } from "@/types/TopDashboardResponse";
import {
  buildDailySchedule,
  TEAM_META,
  TEAM_WEATHER_BASE,
} from "@/mocks/teamDashboardFixtures";
import { TodayGame } from "@/types/TodayGame";

export function buildMockTopDashboard(dateJst?: string): TopDashboardResponse {
  const date = dateJst ?? "2026-02-05";
  const schedule = buildDailySchedule(date);

  const games: TodayGame[] = schedule.map((m, idx) => {
    const weatherAtGameTime = TEAM_WEATHER_BASE[m.home];
    const isOpenAir = TEAM_META[m.home].isOpenAir;

    const base = new Date(`${date}T10:00:00Z`);
    base.setMinutes(base.getMinutes() + idx * 30);

    const cancelProbReason: TodayGame["cancelProbReason"] = isOpenAir
      ? null
      : "INDOOR";

    return {
      gameId: `mock-${date}-${m.home}-${m.away}`,
      startAtUtc: base.toISOString(),
      ballpark: m.ballpark,
      status: "SCHEDULED",
      home: { teamId: m.home, name: TEAM_META[m.home].name },
      away: { teamId: m.away, name: TEAM_META[m.away].name },
      weatherAtGameTime,
      weatherAtGameTimeReason: null,
      cancelProbPct: isOpenAir ? 25 + idx * 3 : null,
      cancelProbReason,
    };
  });

  return {
    batchCompletedAtUtc: `${date}T00:10:00Z`,
    dateJst: date,
    games,
  };
}

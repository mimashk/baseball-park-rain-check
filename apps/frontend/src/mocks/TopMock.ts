import { TopDashboardResponse } from "@/types/TopDashboardResponse";

export function buildMockTopDashboard(): TopDashboardResponse {
  return {
    batchCompletedAtUtc: "2026-02-05T00:10:00Z",
    dateJst: "2026-02-05",
    games: [
      {
        gameId: "mock-1",
        startAtUtc: "2026-02-05T04:00:00Z",
        ballpark: "阪神甲子園球場",
        status: "SCHEDULED",
        home: { teamId: "HT", name: "阪神" },
        away: { teamId: "YG", name: "巨人" },
        weatherAtGameTime: {
          text: "くもり",
          wmoCode: 3,
          temperatureC: 12,
          precipProbPct: 20,
          precipMm: 0,
        },
        cancelProbPct: 15,
      },
      {
        gameId: "mock-2",
        startAtUtc: "2026-02-05T04:30:00Z",
        ballpark: "マツダスタジアム",
        status: "SCHEDULED",
        home: { teamId: "C", name: "広島" },
        away: { teamId: "D", name: "中日" },
        weatherAtGameTime: null,
        cancelProbPct: null,
      },
    ],
  };
}

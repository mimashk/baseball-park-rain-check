import { TodayGame } from "./TodayGame";

export type TopDashboardResponse = {
  batchCompletedAtUtc: string;
  dateJst: string;
  games: TodayGame[];
};

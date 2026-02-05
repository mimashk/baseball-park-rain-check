import { DashboardGameDto } from "./DashboardGameDto";

export interface GetTopDashboardOutput {
  batchCompletedAtUtc: string;
  dateJst: string;
  games: DashboardGameDto[];
}

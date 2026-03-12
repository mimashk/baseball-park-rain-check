import "server-only";
import { buildMockTeam } from "@/mocks/TeamMock";
import { buildMockTopDashboard } from "@/mocks/TopMock";
import { TeamDashboardResponse } from "@/types/TeamDashboardResponse";
import { TopDashboardResponse } from "@/types/TopDashboardResponse";
import { TeamId } from "@/types/TeamId";
import { fetchQueryApiJson } from "./queryApiClient";

const USE_MOCK = process.env.USE_MOCK === "true";
const REVALIDATE_SECONDS = 600;

export async function getTeamDashboardData(
  teamId: TeamId,
  date?: string
): Promise<TeamDashboardResponse> {
  if (USE_MOCK) return buildMockTeam(teamId, date);

  const qs = date ? `?date=${date}` : "";
  return fetchQueryApiJson<TeamDashboardResponse>(
    `/dashboards/teams/${teamId}${qs}`,
    { revalidate: REVALIDATE_SECONDS }
  );
}

export async function getTopDashboardData(
  date?: string
): Promise<TopDashboardResponse> {
  if (USE_MOCK) return buildMockTopDashboard(date);

  const qs = date ? `?date=${date}` : "";
  return fetchQueryApiJson<TopDashboardResponse>(`/dashboards/top${qs}`, {
    revalidate: REVALIDATE_SECONDS,
  });
}

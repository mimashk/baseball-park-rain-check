import { TeamDashboardResponse } from "@/types/TeamDashboardResponse";
import { getBaseUrl } from "./getBaseUrl";
import { TeamId } from "@/types/TeamId";

export async function getTeamDashboard(
  teamId: TeamId,
  date?: string
): Promise<TeamDashboardResponse> {
  const query = date ? `?date=${date}` : "";
  const url = new URL(`/api/team/${teamId}${query}`, await getBaseUrl());

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok)
    throw new Error(`Team画面のデータ取得に失敗しました: ${res.status}`);
  return res.json();
}

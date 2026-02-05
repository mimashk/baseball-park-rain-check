// apps/frontend/src/lib/api/getTopDashboard.ts

import { TopDashboardResponse } from "@/types/TopDashboardResponse";
import { getBaseUrl } from "./getBaseUrl";

export async function getTopDashboard(
  date?: string
): Promise<TopDashboardResponse> {
  const query = date ? `?date=${date}` : "";
  const url = new URL(`/api/top${query}`, await getBaseUrl());

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok)
    throw new Error(`Top画面のデータ取得に失敗しました: ${res.status}`);
  return res.json();
}

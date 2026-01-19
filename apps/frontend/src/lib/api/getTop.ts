import { headers } from "next/headers";
import { TopResponse } from "@/types/top";

async function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return `${proto}://${host}`;
}

export async function getTop(date?: string): Promise<TopResponse> {
  const query = date ? `?date=${date}` : "";
  const url = new URL(`/api/top${query}`, await getBaseUrl());

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok)
    throw new Error(`Top画面のデータ取得に失敗しました: ${res.status}`);
  return res.json();
}

import { buildMockTeam } from "@/mocks/TeamMock";
import { NextRequest, NextResponse } from "next/server";

const QUERY_API_BASE_URL = process.env.QUERY_API_BASE_URL!;
const USE_MOCK = process.env.USE_MOCK === "true";
const CACHE_CONTROL = "s-maxage=1800, max-age=300, stale-while-revalidate=300";

export async function GET(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  const { teamId } = await params;
  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? undefined;

  if (USE_MOCK) {
    const data = buildMockTeam(teamId, date);
    return NextResponse.json(data, {
      headers: { "Cache-Control": CACHE_CONTROL },
    });
  }

  if (!QUERY_API_BASE_URL) {
    return NextResponse.json(
      { message: "QUERY_API_BASE_URL is not set" },
      { status: 500 }
    );
  }

  const upstreamUrl = new URL(
    `/dashboards/teams/${teamId}`,
    QUERY_API_BASE_URL
  );
  if (date) upstreamUrl.searchParams.set("date", date);

  const queryApiToken = process.env.QUERY_API_BEARER_TOKEN;
  if (!queryApiToken) {
    return NextResponse.json(
      { message: "QUERY_API_BEARER_TOKEN が設定されていません" },
      { status: 500 }
    );
  }

  const upstream = await fetch(upstreamUrl, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${queryApiToken}`,
    },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { message: "Team data fetch failed" },
      { status: upstream.status }
    );
  }

  const data = await upstream.json();
  return NextResponse.json(data, {
    headers: { "Cache-Control": CACHE_CONTROL },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { createInfraContainer } from "@infra/di/container";
import { buildMockTop } from "@/mocks/top";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? undefined;

  const teamId = (process.env.FAN_TEAM_ID ?? "HT") as "HT" | "YG";

  if (process.env.MOCK_TOP === "true") {
    return NextResponse.json(buildMockTop(teamId, date));
  }

  const container = createInfraContainer();
  const query = container.resolve("getDashboardQuery");

  const data = await query.execute({
    dateJst: date,
    teamId,
  });

  return NextResponse.json(data);
}

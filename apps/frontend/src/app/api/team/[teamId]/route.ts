import { NextRequest, NextResponse } from "next/server";
import { createInfraContainer } from "@infra/di/container";
import { buildMockTeam } from "@/mocks/TeamMock";

export async function GET(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? undefined;

  if (process.env.USE_MOCK === "true") {
    return NextResponse.json(buildMockTeam(params.teamId, date));
  }

  const container = createInfraContainer();
  const query = container.resolve("getTeamDashboardQuery");

  const data = await query.execute({
    dateJst: date,
    teamId: params.teamId,
  });

  return NextResponse.json(data);
}

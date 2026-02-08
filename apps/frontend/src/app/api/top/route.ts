import { NextRequest, NextResponse } from "next/server";
import { createInfraContainer } from "@infra/di/container";
import { buildMockTopDashboard } from "@/mocks/TopMock";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? undefined;
  if (process.env.USE_MOCK === "true") {
    return NextResponse.json(buildMockTopDashboard(date));
  }

  const container = createInfraContainer();
  const query = container.resolve("getTopDashboardQuery");

  const data = await query.execute({ dateJst: date });
  return NextResponse.json(data);
}

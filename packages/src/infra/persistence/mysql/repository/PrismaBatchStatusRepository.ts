import { PrismaClient } from "@prisma/client";
import { PrismaClientWrapper } from "../PrismaClientWrapper";
import { BatchStatusRepository } from "../../../../application/dashboard/interfaces/BatchStatusRepository";

export class DerivedBatchStatusRepository implements BatchStatusRepository {
  constructor(
    private readonly prisma: PrismaClient = PrismaClientWrapper.getInstance()
  ) {}

  async findLatestCompletedAtUtc(): Promise<Date | null> {
    const [game, hourly, daily] = await Promise.all([
      this.prisma.scheduledGame.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      this.prisma.ballParkHourlyWeatherForecast.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      this.prisma.ballParkDailyWeatherForecast.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ]);

    const candidates = [
      game?.updatedAt,
      hourly?.updatedAt,
      daily?.updatedAt,
    ].filter((d): d is Date => Boolean(d));

    if (candidates.length === 0) return null;
    return new Date(Math.max(...candidates.map((d) => d.getTime())));
  }
}

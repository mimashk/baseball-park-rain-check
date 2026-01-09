import { PastGameRecordRepository } from "../../../../domain/training/repositoryInterface/PastGameRecordRepository";
import { PastGameRecord } from "../../../../domain/training/valueObjects/PastGameRecord";
import { PrismaClientWrapper } from "../PrismaClientWrapper";
import { PastGameRecordModel } from "../prisma/generate/models/PastGameRecord";

type PastGameRecordPersistence = Omit<
  PastGameRecordModel,
  "id" | "createdAt" | "updatedAt"
>;

export class PrismaPastGameRecordRepository
  implements PastGameRecordRepository
{
  private prisma = PrismaClientWrapper.getInstance();

  async upsertMany(records: PastGameRecord[]): Promise<void> {
    const data = records.map(this.toPersistence);
    await this.prisma.$transaction(
      data.map((row) =>
        this.prisma.pastGameRecord.upsert({
          where: { date_homeTeam_awayTeam: row },
          create: row,
          update: row,
        })
      )
    );
  }

  async findByDate(from: Date, to: Date): Promise<PastGameRecord[]> {
    const rows = await this.prisma.pastGameRecord.findMany({
      where: { date: { gte: from, lte: to } },
      orderBy: { date: "asc" },
    });
    return rows.map(this.toDomain);
  }

  private toPersistence(record: PastGameRecord): PastGameRecordPersistence {
    return {
      date: record.date,
      homeTeam: record.homeTeam.value,
      awayTeam: record.awayTeam.value,
      ballPark: record.ballPark.name(),
      cancelled: record.cancelled.value === "CANCELLED",
    };
  }

  private toDomain = (row: PastGameRecordPersistence): PastGameRecord =>
    PastGameRecord.create({
      date: row.date,
      homeTeam: row.homeTeam,
      awayTeam: row.awayTeam,
      ballPark: row.ballPark,
      cancelled: row.cancelled,
    });
}

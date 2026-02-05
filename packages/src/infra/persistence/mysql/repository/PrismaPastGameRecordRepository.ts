import { BaseballTeam } from "../../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { TransactionContext } from "../../../../domain/shared/interfaces/TransactionContext";
import { PastGameRecordRepository } from "../../../../domain/training/repositoryInterface/PastGameRecordRepository";
import { PastGameRecord } from "../../../../domain/training/valueObjects/PastGameRecord";
import { AppError } from "../../../../shared/errors/AppError";
import { DbError } from "../../../../shared/errors/DbError";
import { InfrastructureError } from "../../../../shared/errors/InfrastructureError";
import { PrismaClientWrapper } from "../PrismaClientWrapper";
import { Prisma, PrismaClient } from "@prisma/client";
import { PastGameRecord as PastGameRecordModel } from "@prisma/client";

type PastGameRecordPersistence = Omit<
  PastGameRecordModel,
  "id" | "createdAt" | "updatedAt"
>;

export class PrismaPastGameRecordRepository
  implements PastGameRecordRepository
{
  constructor(
    private readonly prisma: PrismaClient = PrismaClientWrapper.getInstance(),
    private readonly trx?: Prisma.TransactionClient
  ) {}

  withTransaction(trx: TransactionContext): PastGameRecordRepository {
    return new PrismaPastGameRecordRepository(
      this.prisma,
      trx as unknown as Prisma.TransactionClient
    );
  }

  private db() {
    return this.trx ?? this.prisma;
  }

  async upsertMany(records: PastGameRecord[]): Promise<void> {
    const data = records.map(this.toPersistence);
    try {
      await Promise.all(
        data.map((row) =>
          this.db().pastGameRecord.upsert({
            where: {
              date_homeTeam_awayTeam: {
                date: row.date,
                homeTeam: row.homeTeam,
                awayTeam: row.awayTeam,
              },
            },
            create: row,
            update: row,
          })
        )
      );
    } catch (err) {
      throw new DbError("過去試合のupsertに失敗しました", {
        cause: err,
        details: { count: data.length },
      });
    }
  }

  async findByDate(from: Date, to: Date): Promise<PastGameRecord[]> {
    let rows: PastGameRecordModel[];
    try {
      rows = await this.db().pastGameRecord.findMany({
        where: { date: { gte: from, lte: to } },
        orderBy: { date: "asc" },
      });
    } catch (err) {
      throw new DbError("過去試合の取得に失敗しました", {
        cause: err,
        details: { from, to },
      });
    }
    try {
      return rows.map(this.toDomain);
    } catch (err) {
      if (err instanceof AppError) throw err; // ドメイン Validation/DomainError は透過
      throw new InfrastructureError(
        "mapping",
        "DBレコードをドメインに変換できません",
        {
          cause: err,
        }
      );
    }
  }

  private toPersistence(record: PastGameRecord): PastGameRecordPersistence {
    return {
      date: record.date,
      homeTeam: record.homeTeam.id(),
      awayTeam: record.awayTeam.id(),
      ballPark: record.ballPark.name(),
      cancelled: record.cancelled.value === "CANCELLED",
    };
  }

  private toDomain = (row: PastGameRecordPersistence): PastGameRecord =>
    PastGameRecord.create({
      date: row.date,
      homeTeam: BaseballTeam.from(row.homeTeam).id(),
      awayTeam: BaseballTeam.from(row.awayTeam).id(),
      ballPark: row.ballPark,
      cancelled: row.cancelled,
    });
}

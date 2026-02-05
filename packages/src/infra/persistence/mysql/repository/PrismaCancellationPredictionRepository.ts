import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaClientWrapper } from "../PrismaClientWrapper";
import { CancellationPredictionRepository } from "../../../../application/prediction/interfaces/CancellationPredictionRepository";
import { CancellationPredictionDto } from "../../../../application/prediction/dtos/CancellationPredictionDto";
import { TransactionContext } from "../../../../domain/shared/interfaces/TransactionContext";
import { DbError } from "../../../../shared/errors/DbError";

export class PrismaCancellationPredictionRepository
  implements CancellationPredictionRepository
{
  constructor(
    private readonly prisma: PrismaClient = PrismaClientWrapper.getInstance(),
    private readonly trx?: Prisma.TransactionClient
  ) {}

  withTransaction(trx: TransactionContext): CancellationPredictionRepository {
    return new PrismaCancellationPredictionRepository(
      this.prisma,
      trx as unknown as Prisma.TransactionClient
    );
  }

  private db() {
    return this.trx ?? this.prisma;
  }

  async upsert(pred: CancellationPredictionDto): Promise<void> {
    try {
      await this.db().cancellationPrediction.upsert({
        where: { gameId: pred.gameId }, // 案A
        create: {
          gameId: pred.gameId,
          probability: pred.probability,
          modelVersion: pred.modelVersion,
          predictedAt: new Date(pred.predictedAtUtc),
        },
        update: {
          probability: pred.probability,
          modelVersion: pred.modelVersion,
          predictedAt: new Date(pred.predictedAtUtc),
        },
      });
    } catch (err) {
      throw new DbError("中止予測結果の保存に失敗しました", {
        cause: err,
        details: { gameId: pred.gameId },
      });
    }
  }

  async findLatestByGameIds(
    gameIds: string[]
  ): Promise<Map<string, CancellationPredictionDto>> {
    const rows = await this.db().cancellationPrediction.findMany({
      where: { gameId: { in: gameIds } },
    });
    return new Map(
      rows.map((r) => [
        r.gameId,
        {
          gameId: r.gameId,
          probability: r.probability,
          modelVersion: r.modelVersion,
          predictedAtUtc: r.predictedAt.toISOString(),
        },
      ])
    );
  }
}

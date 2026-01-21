import { CancellationModelRepository } from "../../../../domain/model/repositoryInterface/CancellationModelRepository";
import { CancellationModel } from "../../../../domain/model/valueObjects/CancellationModel";
import {
  CancellationModel as CancellationModelModel,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import { PrismaClientWrapper } from "../PrismaClientWrapper";
import { ModelVersion } from "../../../../domain/model/valueObjects/ModelVersion";
import { TransactionContext } from "../../../../domain/shared/interfaces/TransactionContext";
import { DbError } from "../../../../shared/errors/DbError";
import { AppError } from "../../../../shared/errors/AppError";
import { InfrastructureError } from "../../../../shared/errors/InfrastructureError";
import { BallParkId } from "../../../../domain/scheduledGame/valueObjects/BallPark";

type CancellationModelPersistence = Prisma.CancellationModelCreateInput &
  Prisma.CancellationModelUpdateInput;

type CancellationModelMetadata = {
  mean?: number[];
  std?: number[];
  [key: string]: unknown;
};
export class PrismaCancellationModelRepository
  implements CancellationModelRepository
{
  constructor(
    private readonly prisma: PrismaClient = PrismaClientWrapper.getInstance()
  ) {}

  withTransaction(tx: TransactionContext): CancellationModelRepository {
    return new PrismaCancellationModelRepository(tx as unknown as PrismaClient);
  }

  async save(model: CancellationModel): Promise<void> {
    const persistence = this.toPersistence(model);
    try {
      await this.prisma.cancellationModel.upsert({
        where: {
          version_ballParkId: {
            version: persistence.version,
            ballParkId: persistence.ballParkId,
          },
        },
        create: persistence,
        update: persistence,
      });
    } catch (err) {
      throw new DbError("試合中止予測モデルの保存に失敗しました", {
        cause: err,
        details: { version: persistence.version },
      });
    }
  }

  async findLatest(ballParkId: BallParkId): Promise<CancellationModel | null> {
    let row: CancellationModelModel | null;
    try {
      row = await this.prisma.cancellationModel.findFirst({
        orderBy: { createdAt: "desc" },
        where: { ballParkId },
      });
    } catch (err) {
      throw new DbError("キャンセルモデルの取得に失敗しました", { cause: err });
    }
    if (!row) return null;
    return this.mapRow(row);
  }

  private toPersistence(
    model: CancellationModel
  ): CancellationModelPersistence {
    return {
      version: model.version.toString(),
      ballParkId: model.ballParkId,
      featureOrder: model.featureOrder as Prisma.InputJsonValue,
      coefficients: model.coefficients as Prisma.InputJsonValue,
      intercept: model.intercept,
      metadata: { mean: model.mean, std: model.std } as Prisma.InputJsonValue,
    };
  }

  private mapRow(row: CancellationModelModel): CancellationModel {
    try {
      return this.toDomain(row);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new InfrastructureError(
        "mapping",
        "試合中止予測モデルをドメインに変換できません",
        { cause: err, details: { version: row.version } }
      );
    }
  }

  private toDomain(row: CancellationModelModel): CancellationModel {
    const metadata = (row.metadata ?? {}) as CancellationModelMetadata;
    const version = ModelVersion.fromString(row.version);
    const date = version.toDate();
    return CancellationModel.create({
      date,
      ballParkId: row.ballParkId as unknown as BallParkId,
      featureOrder: row.featureOrder as string[],
      coefficients: row.coefficients as number[],
      intercept: row.intercept,
      mean: metadata.mean as number[],
      std: metadata.std as number[],
    });
  }
}

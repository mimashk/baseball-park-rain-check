import { CancellationModelRepository } from "../../../../domain/model/repositoryInterface/CancellationModelRepository";
import { CancellationModel } from "../../../../domain/model/valueObjects/CancellationModel";
import { ModelVersion } from "../../../../domain/model/valueObjects/ModelVersion";
import { BallParkId } from "../../../../domain/scheduledGame/valueObjects/BallPark";
import { TransactionContext } from "../../../../domain/shared/interfaces/TransactionContext";
import { AppError } from "../../../../shared/errors/AppError";
import { InfrastructureError } from "../../../../shared/errors/InfrastructureError";
import { ObjectStorageError } from "../../../../shared/errors/ObjectStorageError";
import { R2ObjectStore } from "../R2ObjectStore";
import { cancellationModelLatestFileKey } from "../utils/keyBuilders";

type CancellationModelDoc = {
  version: string; // yyyymmddHHMM
  ballParkId: number;
  featureOrder: string[];
  coefficients: number[];
  intercept: number;
  metadata?: {
    mean?: number[];
    std?: number[];
    [key: string]: unknown;
  };
};

export class R2CancellationModelRepository
  implements CancellationModelRepository
{
  constructor(private readonly store: R2ObjectStore) {}

  async save(model: CancellationModel): Promise<void> {
    const key = cancellationModelLatestFileKey(model.ballParkId);
    const doc: CancellationModelDoc = {
      version: model.version.toString(),
      ballParkId: model.ballParkId,
      featureOrder: model.featureOrder,
      coefficients: model.coefficients,
      intercept: model.intercept,
      metadata: {
        mean: model.mean,
        std: model.std,
      },
    };

    try {
      await this.store.putJson(key, doc); // latestを上書き
    } catch (err) {
      throw new ObjectStorageError("試合中止予測モデルの保存に失敗しました", {
        cause: err,
        details: { key, ballParkId: model.ballParkId },
      });
    }
  }

  async findLatest(ballParkId: BallParkId): Promise<CancellationModel | null> {
    const key = cancellationModelLatestFileKey(ballParkId);

    let doc: CancellationModelDoc | null;
    try {
      doc = await this.store.getJson<CancellationModelDoc>(key);
    } catch (err) {
      throw new ObjectStorageError("キャンセルモデルの取得に失敗しました", {
        cause: err,
        details: { key, ballParkId },
      });
    }

    if (!doc) return null;

    try {
      const date = ModelVersion.fromString(doc.version).toDate();
      return CancellationModel.create({
        date,
        ballParkId: doc.ballParkId as BallParkId,
        featureOrder: doc.featureOrder,
        coefficients: doc.coefficients,
        intercept: doc.intercept,
        mean: (doc.metadata?.mean ?? []) as number[],
        std: (doc.metadata?.std ?? []) as number[],
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new InfrastructureError(
        "mapping",
        "R2モデルデータをドメインに変換できません",
        { cause: err, details: { key, version: doc.version } }
      );
    }
  }
}

import { CancellationPredictionRepository } from "../../../../application/prediction/interfaces/CancellationPredictionRepository";
import { CancellationPredictionDto } from "../../../../application/prediction/dtos/CancellationPredictionDto";
import { TransactionContext } from "../../../../domain/shared/interfaces/TransactionContext";
import { R2ObjectStore } from "../R2ObjectStore";
import { cancellationPredictionFileKey } from "../utils/keyBuilders";
import { ObjectStorageError } from "../../../../shared/errors/ObjectStorageError";

export class R2CancellationPredictionRepository
  implements CancellationPredictionRepository
{
  constructor(private readonly store: R2ObjectStore) {}

  async upsert(prediction: CancellationPredictionDto): Promise<void> {
    try {
      await this.store.putJson(
        cancellationPredictionFileKey(prediction.gameId),
        prediction
      );
    } catch (err: unknown) {
      throw new ObjectStorageError("中止予測結果の保存に失敗しました", {
        cause: err,
        details: { gameId: prediction.gameId },
      });
    }
  }

  async findLatestByGameIds(
    gameIds: string[]
  ): Promise<Map<string, CancellationPredictionDto>> {
    try {
      const rows = await Promise.all(
        gameIds.map((id) =>
          this.store.getJson<CancellationPredictionDto>(
            cancellationPredictionFileKey(id)
          )
        )
      );
      const map = new Map<string, CancellationPredictionDto>();
      rows.forEach((row) => {
        if (row) map.set(row.gameId, row);
      });
      return map;
    } catch (err: unknown) {
      throw new ObjectStorageError("中止予測結果の取得に失敗しました", {
        cause: err,
        details: { gameIds },
      });
    }
  }
}

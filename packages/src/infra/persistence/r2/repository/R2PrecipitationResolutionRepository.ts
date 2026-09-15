import { PrecipitationResolutionDto } from "../../../../application/prediction/dtos/PrecipitationResolutionDto";
import { PrecipitationResolutionRepository } from "../../../../application/prediction/interfaces/PrecipitationResolutionRepository";
import { ObjectStorageError } from "../../../../shared/errors/ObjectStorageError";
import { R2ObjectStore } from "../R2ObjectStore";
import { precipitationResolutionFileKey } from "../utils/keyBuilders";
import { toJstDateKeyByParts } from "../utils/dateKeyGenerator";

/**
 * 降水量の差し替え記録を追記する。
 *
 * 既存の `R2BallParkHourlyWeatherForecastRepository` と違い、読み書きのマージをしない。
 * 実行ごとに独立したオブジェクトを置くだけなので、
 * 並行実行しても互いの記録を壊さず、リード時間ごとの履歴も残る。
 */
export class R2PrecipitationResolutionRepository
  implements PrecipitationResolutionRepository
{
  constructor(private readonly store: R2ObjectStore) {}

  async append(resolution: PrecipitationResolutionDto): Promise<void> {
    const resolvedAt = new Date(resolution.resolvedAt);
    if (Number.isNaN(resolvedAt.getTime())) {
      throw new ObjectStorageError("差し替え記録の時刻が不正です", {
        details: { resolvedAt: resolution.resolvedAt },
      });
    }

    const key = precipitationResolutionFileKey(
      resolution.ballParkId,
      toJstDateKeyByParts(resolvedAt),
      resolvedAt.toISOString()
    );

    try {
      await this.store.putJson(key, resolution);
    } catch (err: unknown) {
      throw new ObjectStorageError("降水量の差し替え記録の保存に失敗しました", {
        cause: err,
        details: { key, ballParkId: resolution.ballParkId },
      });
    }
  }
}

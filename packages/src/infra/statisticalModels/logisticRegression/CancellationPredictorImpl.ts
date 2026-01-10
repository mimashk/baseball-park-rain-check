import { CancellationPredictor } from "../../../application/prediction/interfaces/CancellationPredictor";
import { CancellationModelDto } from "../../../application/shared/dtos/CancellationModelDto";
import { FeatureRow } from "../../../application/prediction/dtos/FeatureRow";
import { CancellationFeaturePreprocessor } from "./CancellationFeaturePreprocessor";
import { FeatureKey } from "./FeatureOrder";
import { ValidationError } from "../../../shared/errors/ValidationError";

type FeatureMap = Record<FeatureKey, number>;

export class CancellationPredictorImpl implements CancellationPredictor {
  predict(params: {
    model: CancellationModelDto;
    features: FeatureRow;
  }): number {
    const { model, features } = params;

    // モデルと特徴量の次元チェック
    if (
      model.coefficients.length !==
        CancellationFeaturePreprocessor.featureOrder.length ||
      model.mean.length !==
        CancellationFeaturePreprocessor.featureOrder.length ||
      model.std.length !== CancellationFeaturePreprocessor.featureOrder.length
    ) {
      throw new ValidationError(
        "モデルの係数/mean/std の次元が一致していません",
        {
          coeffLen: model.coefficients.length,
          meanLen: model.mean.length,
          stdLen: model.std.length,
          expected: CancellationFeaturePreprocessor.featureOrder.length,
        }
      );
    }

    const featureMap: FeatureMap = {
      avgTemperature: features.avgTemperature,
      avgRainFall: features.avgRainFall,
      rainOccurRate: features.rainOccurRate,
      sampleCount: features.sampleCount,
    };

    // 1) 特徴ベクトル化（欠損/非数チェック含む）
    const vec = CancellationFeaturePreprocessor.toFeatureVector(featureMap);

    // 2) 学習時の mean/std で標準化
    const normalized = CancellationFeaturePreprocessor.applyStandardization(
      vec,
      model.mean, // モデルに保持させる
      model.std
    );

    // 3) ロジスティック回帰の線形結合
    const z = normalized.reduce(
      (acc, x, i) => acc + x * model.coefficients[i],
      model.intercept
    );
    const prob = 1 / (1 + Math.exp(-z));

    return prob;
  }
}

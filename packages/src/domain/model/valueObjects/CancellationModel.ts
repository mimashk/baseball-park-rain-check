import { FeatureRow } from "../../prediction/dtos/FeatureRow";
import { ModelVersion } from "./ModelVersion";

export class CancellationModel {
  private constructor(
    readonly version: ModelVersion,
    readonly featureOrder: string[],
    readonly coefficients: number[], // 同じ順序
    readonly intercept: number
  ) {}
  static create(props: {
    version: ModelVersion;
    featureOrder: string[];
    coefficients: number[];
    intercept: number;
  }): CancellationModel {
    if (
      props.featureOrder.length !== props.coefficients.length ||
      props.featureOrder.length === 0
    )
      throw new Error("係数と特徴量の対応が不正です");
    return new CancellationModel(
      props.version,
      props.featureOrder,
      props.coefficients,
      props.intercept
    );
  }
  // 予測用の簡易メソッド（必要なら）
  predict(featureRow: FeatureRow): number {
    const z = this.featureOrder.reduce(
      (acc, key, i) => acc + (featureRow[key] ?? 0) * this.coefficients[i],
      this.intercept
    );
    return 1 / (1 + Math.exp(-z));
  }
}

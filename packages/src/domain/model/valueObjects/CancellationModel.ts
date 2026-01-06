import { CancellationModelDto } from "../dtos/CancellationModelDto";
import { ModelVersion } from "./ModelVersion";

export class CancellationModel {
  private constructor(
    readonly version: ModelVersion,
    readonly featureOrder: string[],
    readonly coefficients: number[], // 同じ順序
    readonly intercept: number,
    readonly mean: number[],
    readonly std: number[]
  ) {}
  static create(props: {
    version: ModelVersion;
    featureOrder: string[];
    coefficients: number[];
    intercept: number;
    mean: number[];
    std: number[];
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
      props.intercept,
      props.mean,
      props.std
    );
  }

  toPrimitive(): CancellationModelDto {
    return {
      date: this.version.toDate(),
      featureOrder: this.featureOrder,
      coefficients: this.coefficients,
      intercept: this.intercept,
      mean: this.mean,
      std: this.std,
    };
  }
}

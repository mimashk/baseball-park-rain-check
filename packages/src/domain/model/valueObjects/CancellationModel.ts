import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import {
  ensureFiniteArray,
  ensureFiniteNumber,
} from "../../shared/utils/ensureFinite";
import { ModelVersion } from "./ModelVersion";

export interface CancellationModelProps {
  date: Date;
  featureOrder: string[];
  coefficients: number[];
  intercept: number;
  mean: number[];
  std: number[];
}
export class CancellationModel {
  private constructor(
    readonly version: ModelVersion,
    readonly featureOrder: string[],
    readonly coefficients: number[], // 同じ順序
    readonly intercept: number,
    readonly mean: number[],
    readonly std: number[]
  ) {}
  static create(props: CancellationModelProps): CancellationModel {
    if (!props.featureOrder || props.featureOrder.length === 0) {
      throw new ValidationError("特徴量の順序が空です");
    }

    const len = props.featureOrder.length;

    this.checkSameLength("coefficients", props.coefficients, len);
    this.checkSameLength("mean", props.mean, len);
    this.checkSameLength("std", props.std, len);

    ensureFiniteArray("coefficients", props.coefficients);
    ensureFiniteArray("mean", props.mean);
    ensureFiniteArray("std", props.std);
    ensureFiniteNumber("intercept", props.intercept);
    this.ensureNoDuplicates(props.featureOrder);
    return new CancellationModel(
      ModelVersion.fromDate(props.date),
      props.featureOrder,
      props.coefficients,
      props.intercept,
      props.mean,
      props.std
    );
  }

  private static checkSameLength(
    name: string,
    arr: unknown[],
    expected: number
  ): asserts arr is number[] {
    if (!Array.isArray(arr) || arr.length !== expected) {
      throw new DomainError("係数と特徴量の対応が不正です", {
        featureCount: expected,
        [name + "Count"]: Array.isArray(arr) ? arr.length : undefined,
      });
    }
  }

  private static ensureNoDuplicates(featureOrder: string[]): void {
    const duplicates = featureOrder.filter((v, i, arr) => arr.indexOf(v) !== i);
    if (duplicates.length > 0) {
      throw new DomainError("特徴量名が重複しています", { duplicates });
    }
  }
}

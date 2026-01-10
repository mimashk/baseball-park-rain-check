import { ValidationError } from "../../../shared/errors/ValidationError";
import { featureOrder } from "./FeatureOrder";

type FeatureVector = number[];

export class CancellationFeaturePreprocessor {
  static readonly featureOrder = featureOrder;

  static toFeatureVector(x: Record<string, number>): FeatureVector {
    return this.featureOrder.map((key) => {
      const v = x[key];
      if (!Number.isFinite(v)) {
        throw new ValidationError(`特徴量 ${key} が欠損または非数です`, {
          field: key,
          value: v,
        });
      }
      return v;
    });
  }

  static filterFiniteRows<T extends { x: Record<string, number> }>(
    rows: T[]
  ): T[] {
    const validRows = rows.filter((r) =>
      this.featureOrder.every((k) => Number.isFinite(r.x[k]))
    );
    if (!validRows.length)
      throw new ValidationError("有限な特徴量の行がありません");
    return validRows;
  }

  static standardize(vectors: FeatureVector[]): {
    normalized: FeatureVector[];
    mean: number[];
    std: number[];
  } {
    const dim = this.featureOrder.length;
    if (!vectors.length) {
      throw new ValidationError("標準化対象のベクトルが空です");
    }

    // 長さ・有限値チェック
    for (const v of vectors) {
      if (v.length !== dim) {
        throw new ValidationError("特徴量の次元が一致しません", {
          expected: dim,
          actual: v.length,
        });
      }
      if (!v.every(Number.isFinite)) {
        throw new ValidationError("特徴量に非数または欠損が含まれています");
      }
    }
    const mean = Array(dim).fill(0);
    const std = Array(dim).fill(0);

    for (const v of vectors) v.forEach((x, i) => (mean[i] += x));
    mean.forEach((_, i) => (mean[i] /= vectors.length));

    for (const v of vectors)
      v.forEach((x, i) => (std[i] += (x - mean[i]) ** 2));
    std.forEach((_, i) => (std[i] = Math.sqrt(std[i] / vectors.length) || 1));

    const normalized = vectors.map((v) =>
      v.map((x, i) => (x - mean[i]) / std[i])
    );
    return { normalized, mean, std };
  }

  static applyStandardization(
    vector: FeatureVector,
    mean: number[],
    std: number[]
  ): FeatureVector {
    return vector.map((x, i) => (x - mean[i]) / std[i]);
  }
}

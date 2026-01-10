import LogisticRegression from "ml-logistic-regression";
import { Matrix } from "ml-matrix";
import { CancellationModelTrainer } from "../../../application/training/interfaces/CancellationModelTrainer";
import { TrainingRow } from "../../../application/training/dtos/TrainingRow";
import { CancellationModelDto } from "../../../application/shared/dtos/CancellationModelDto";
import { CancellationFeaturePreprocessor } from "./CancellationFeaturePreprocessor";
import { featureOrder } from "./FeatureOrder";
import { InfrastructureError } from "../../../shared/errors/InfrastructureError";

export class CancellationModelTrainerImpl implements CancellationModelTrainer {
  private readonly featureOrder = featureOrder;

  async train(rows: TrainingRow[]): Promise<CancellationModelDto> {
    const finiteRows = CancellationFeaturePreprocessor.filterFiniteRows(rows);
    const features = finiteRows.map((row) =>
      CancellationFeaturePreprocessor.toFeatureVector(row.x)
    );
    const labels = finiteRows.map((row) => row.y);
    const { normalized, mean, std } =
      CancellationFeaturePreprocessor.standardize(features);
    try {
      const X = new Matrix(normalized);
      const y = Matrix.columnVector(labels);

      const logisticRegression = new LogisticRegression({
        numSteps: 2000,
        learningRate: 5e-3,
      });
      logisticRegression.train(X, y);

      const coefficients = logisticRegression.weights.to1DArray(); // featureOrderと同順
      const intercept = logisticRegression.bias; // ライブラリAPIに合わせて取得

      return {
        date: new Date(),
        featureOrder: [...this.featureOrder],
        coefficients,
        intercept,
        mean,
        std,
      };
    } catch (err) {
      throw new InfrastructureError("internal", "モデルの学習に失敗しました", {
        cause: err,
        details: { rows },
      });
    }
  }
}

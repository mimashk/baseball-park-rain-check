import { Matrix } from "ml-matrix";

type LogisticRegressionOptions = {
  numSteps?: number;
  learningRate?: number;
};

declare module "ml-logistic-regression" {
  export default class LogisticRegression {
    constructor(options?: LogisticRegressionOptions);
    train(features: Matrix, labels: Matrix): void;
    weights: Matrix;
    bias: number;
  }
}


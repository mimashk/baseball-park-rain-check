declare module "ml-logistic-regression" {
  import type { Matrix } from "ml-matrix";

  export interface LogisticRegressionOptions {
    numSteps?: number;
    learningRate?: number;
    classifiers?: any[];
    numberClasses?: number;
  }

  export default class LogisticRegression {
    constructor(options?: LogisticRegressionOptions);
    numSteps: number;
    learningRate: number;
    classifiers: any[];
    numberClasses: number;
    train(X: Matrix, Y: Matrix): void;
    predict(Xtest: Matrix): number[];
    toJSON(): unknown;
    static load(model: unknown): LogisticRegression;
  }
}

declare module "ml-logistic-regression/lib/logreg_2classes" {
  import type { Matrix } from "ml-matrix";

  export interface LogisticRegressionTwoClassesOptions {
    numSteps?: number;
    learningRate?: number;
    weights?: Matrix | number[] | number[][];
  }

  export default class LogisticRegressionTwoClasses {
    constructor(options?: LogisticRegressionTwoClassesOptions);
    numSteps: number;
    learningRate: number;
    weights: Matrix | null;
    train(features: Matrix, target: Matrix): void;
    testScores(features: Matrix): number[];
    predict(features: Matrix): number[];
    toJSON(): unknown;
    static load(model: unknown): LogisticRegressionTwoClasses;
  }
}

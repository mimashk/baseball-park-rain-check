export interface TrainCancellationModelResponse {
  message: string;
  model: {
    version: string;
    featureOrder: string[];
    coefficients: number[];
    intercept: number;
    trainedCount: number;
  };
}

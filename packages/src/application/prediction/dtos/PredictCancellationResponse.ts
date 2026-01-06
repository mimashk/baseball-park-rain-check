export interface PredictCancellationResponse {
  message: string;
  probability: number; // 0..1
  modelVersion: string;
}

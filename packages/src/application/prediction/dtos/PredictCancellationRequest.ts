export interface PredictCancellationRequest {
  timeWindowBeforeHours: number;
  timeWindowAfterHours: number;
  forecastDays: number;
}

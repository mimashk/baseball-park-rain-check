export interface PredictCancellationRequest {
  timeWindowBeforeHours: number;
  timeWindowAfterHours: number;
  forecastDays: number;
  todayDate: Date;
}

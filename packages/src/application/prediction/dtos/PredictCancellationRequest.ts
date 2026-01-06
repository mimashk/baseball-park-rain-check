export interface PredictCancellationRequest {
  gameId: string; // 予測対象の試合ID
  timeWindowBeforeHours: number;
  timeWindowAfterHours: number;
  modelVersion: string; // 使用するモデル版
}

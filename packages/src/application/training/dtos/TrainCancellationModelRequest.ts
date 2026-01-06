export interface TrainCancellationModelRequest {
  timeWindowBeforeHours: number;
  timeWindowAfterHours: number;
  from: Date;
  to: Date;
  limit?: number; // 直近 n 件だけ学習したい場合
}

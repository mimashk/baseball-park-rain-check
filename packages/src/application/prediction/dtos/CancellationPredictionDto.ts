export type CancellationPredictionDto = {
  gameId: string;
  probability: number;
  modelVersion: string;
  predictedAtUtc: string;
};

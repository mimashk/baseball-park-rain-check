export interface PredictCancellationResponse {
  message: string;
  results: Array<
    | {
        success: true;
        gameId: string;
        probability: number;
        modelVersion: string;
      }
    | {
        success: false;
        gameId: string;
        modelVersion: string | null;
        error: string;
      }
  >;
}

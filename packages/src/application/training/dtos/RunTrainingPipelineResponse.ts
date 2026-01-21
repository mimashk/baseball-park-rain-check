import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";

export interface RunTrainingPipelineResponse {
  message: string;
  results: {
    version: string;
    ballParkId: BallParkId;
    featureOrder: string[];
    coefficients: number[];
    intercept: number;
    trainedCount: number;
  }[];
}

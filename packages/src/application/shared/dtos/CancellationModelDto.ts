import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";

export interface CancellationModelDto {
  date: Date;
  ballParkId: BallParkId;
  featureOrder: string[];
  coefficients: number[];
  intercept: number;
  mean: number[];
  std: number[];
}

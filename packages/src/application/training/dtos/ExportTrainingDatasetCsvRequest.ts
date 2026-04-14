import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";

export interface ExportTrainingDatasetCsvRequest {
  from: Date;
  to: Date;
  timeWindowBeforeHours: number;
  timeWindowAfterHours: number;
  ballParkId?: BallParkId;
}

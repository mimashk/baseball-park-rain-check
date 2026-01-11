import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";

export interface RunTrainingPipelineRequest {
  ballParkId: BallParkId;
  from: Date;
  to: Date;
  timeWindowBeforeHours: number;
  timeWindowAfterHours: number;
}

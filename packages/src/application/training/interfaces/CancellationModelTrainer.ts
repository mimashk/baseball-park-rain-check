import { TrainingRow } from "../dtos/TrainingRow";
import { CancellationModelDto } from "../../shared/dtos/CancellationModelDto";
import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";

export interface CancellationModelTrainer {
  train(
    examples: TrainingRow[],
    ballParkId: BallParkId
  ): Promise<CancellationModelDto>;
}

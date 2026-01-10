import { TrainingRow } from "../dtos/TrainingRow";
import { CancellationModelDto } from "../../shared/dtos/CancellationModelDto";

export interface CancellationModelTrainer {
  train(examples: TrainingRow[]): Promise<CancellationModelDto>;
}

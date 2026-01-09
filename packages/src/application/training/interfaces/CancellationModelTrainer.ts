import { TrainingRow } from "../dtos/TrainingRow";
import { CancellationModelDto } from "../../../domain/model/dtos/CancellationModelDto";

export interface CancellationModelTrainer {
  train(examples: TrainingRow[]): Promise<CancellationModelDto>;
}

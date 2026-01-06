import { CancellationModel } from "../../../domain/model/valueObjects/CancellationModel";
import { TrainingRow } from "../../../domain/training/dtos/TrainingRow";

export interface CancellationModelTrainer {
  train(examples: TrainingRow[]): Promise<CancellationModel>;
}

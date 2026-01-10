import { CancellationModel } from "../valueObjects/CancellationModel";
import { ModelVersion } from "../valueObjects/ModelVersion";

export interface CancellationModelRepository {
  save(model: CancellationModel): Promise<void>;
  load(version: ModelVersion): Promise<CancellationModel | null>;
}

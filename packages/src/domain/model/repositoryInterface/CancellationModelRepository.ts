import { CancellationModel } from "../valueObjects/CancellationModel";

export interface CancellationModelRepository {
  save(model: CancellationModel): Promise<void>;
  load(version: string): Promise<CancellationModel | null>;
}

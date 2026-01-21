import { BallParkId } from "../../scheduledGame/valueObjects/BallPark";
import { TransactionContext } from "../../shared/interfaces/TransactionContext";
import { CancellationModel } from "../valueObjects/CancellationModel";
import { ModelVersion } from "../valueObjects/ModelVersion";

export interface CancellationModelRepository {
  withTransaction(tx: TransactionContext): CancellationModelRepository;
  save(model: CancellationModel): Promise<void>;
  findLatest(ballParkId: BallParkId): Promise<CancellationModel | null>;
}

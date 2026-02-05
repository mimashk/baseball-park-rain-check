import { CancellationPredictionDto } from "../dtos/CancellationPredictionDto";
import { TransactionContext } from "../../../domain/shared/interfaces/TransactionContext";

export interface CancellationPredictionRepository {
  withTransaction(tx: TransactionContext): CancellationPredictionRepository;

  upsert(prediction: CancellationPredictionDto): Promise<void>;

  findLatestByGameIds(
    gameIds: string[]
  ): Promise<Map<string, CancellationPredictionDto>>;
}

import { TransactionExecutor } from "../../../application/shared/interfaces/TransactionExecutor";
import { TransactionContext } from "../../../domain/shared/interfaces/TransactionContext";

export class NoopTransactionExecutor implements TransactionExecutor {
  async run<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
    // R2運用ではトランザクション境界を持たないので、そのまま実行
    return fn({});
  }
}

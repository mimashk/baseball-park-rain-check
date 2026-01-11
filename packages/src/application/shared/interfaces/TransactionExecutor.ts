import { TransactionContext } from "../../../domain/shared/interfaces/TransactionContext";

export interface TransactionExecutor {
  run<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
}

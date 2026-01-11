import { TransactionContext } from "../../shared/interfaces/TransactionContext";
import { PastGameRecord } from "../valueObjects/PastGameRecord";

export interface PastGameRecordRepository {
  withTransaction(tx: TransactionContext): PastGameRecordRepository;
  upsertMany(pastGameRecords: PastGameRecord[]): Promise<void>;
  findByDate(from: Date, to: Date): Promise<PastGameRecord[]>;
}

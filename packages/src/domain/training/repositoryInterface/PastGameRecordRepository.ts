import { PastGameRecord } from "../valueObjects/PastGameRecord";

export interface PastGameRecordRepository {
  upsertMany(pastGameRecords: PastGameRecord[]): Promise<void>;
  findByDate(from: Date, to: Date): Promise<PastGameRecord[]>;
}

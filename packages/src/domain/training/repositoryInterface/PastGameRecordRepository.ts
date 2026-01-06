import { PastGameRecord } from "../valueObjects/PastGameRecord";

export interface PastGameRecordRepository {
  saveMany(pastGameRecords: PastGameRecord[]): Promise<void>;
  findByDate(from: Date, to: Date): Promise<PastGameRecord[]>;
}

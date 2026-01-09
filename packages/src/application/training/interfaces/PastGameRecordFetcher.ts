import { PastGameRecordDto } from "../dtos/PastGameRecordDto";

export interface PastGameRecordFetcher {
  fetchPastGameRecords(from: Date, to: Date): Promise<PastGameRecordDto[]>;
}

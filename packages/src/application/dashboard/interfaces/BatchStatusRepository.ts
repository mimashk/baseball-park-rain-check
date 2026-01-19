export interface BatchStatusRepository {
  findLatestCompletedAtUtc(): Promise<Date | null>;
}

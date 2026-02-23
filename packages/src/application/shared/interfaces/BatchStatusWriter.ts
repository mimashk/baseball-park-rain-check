export type BatchJobName = "refresher" | "prediction" | "trainer";

export interface BatchStatusWriter {
  markSuccess(job: BatchJobName, completedAt?: Date): Promise<void>;
}

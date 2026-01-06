export interface CheckpointScheduler {
  upsertCheckpoint(input: {
    jobKey: string;
    runAt: Date;
    endpointPath: string;
    query: Record<string, string>;
  }): Promise<void>;

  deleteCheckpoint(jobKey: string): Promise<void>;
}

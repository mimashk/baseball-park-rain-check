export type ScheduleInitialGameCheckpointResponse =
  | {
      message: string;
    }
  | {
      message: string;
      checkpoints: Array<{
        gameId: string;
        jobKey: string;
        nextRunAt: Date;
      }>;
    };

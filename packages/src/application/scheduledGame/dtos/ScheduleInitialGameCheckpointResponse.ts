// export type ScheduleInitialGameCheckpointResponse = {
//   nextRunAt: Date | null;
//   jobKey: string | null;
//   message: string;
// };

export type ScheduleInitialGameCheckpointResponse =
  | {
      nextRunAt: Date;
      jobKey: string;
      message: string;
    }
  | {
      message: string;
    };

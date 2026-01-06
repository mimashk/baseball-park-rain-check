import { CreateScheduledGameProps } from "../../../domain/scheduledGame/entities/ScheduledGame";

export interface ScheduledGameFetcher {
  fetchScheduledGames(
    from: Date,
    to: Date
  ): Promise<CreateScheduledGameProps[]>;
}

import { ScheduledGameDto } from "../dtos/ScheduledGameDto";

export interface ScheduledGameFetcher {
  fetchScheduledGames(from: Date, to: Date): Promise<ScheduledGameDto[]>;
}

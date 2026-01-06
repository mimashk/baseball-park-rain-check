import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";

export interface GameStatusFetcher {
  fetchStatus(input: {
    date: Date;
    homeTeamName: string;
    awayTeamName: string;
  }): Promise<{
    status: GameStatusType;
  }>;
}

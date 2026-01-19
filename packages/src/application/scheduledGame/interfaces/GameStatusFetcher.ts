import { TeamId } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { GameStatusDto } from "../dtos/GameStatusDto";

export interface GameStatusFetcher {
  fetchStatus(input: {
    date: Date;
    homeTeamId: TeamId;
    awayTeamId: TeamId;
  }): Promise<GameStatusDto>;
}

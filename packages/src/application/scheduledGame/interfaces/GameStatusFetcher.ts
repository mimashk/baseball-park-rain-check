import { BaseballTeamType } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { GameStatusDto } from "../dtos/GameStatusDto";

export interface GameStatusFetcher {
  fetchStatus(input: {
    date: Date;
    homeTeamName: BaseballTeamType;
    awayTeamName: BaseballTeamType;
  }): Promise<GameStatusDto>;
}

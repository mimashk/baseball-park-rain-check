import { BaseballTeamType } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";

export interface GameStatusDto {
  homeTeam: BaseballTeamType;
  awayTeam: BaseballTeamType;
  status: GameStatusType;
}

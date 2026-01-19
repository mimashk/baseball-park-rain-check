import { TeamId } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";

export interface GameStatusDto {
  homeTeam: TeamId;
  awayTeam: TeamId;
  status: GameStatusType;
}
